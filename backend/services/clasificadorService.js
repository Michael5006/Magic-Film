// ── Keywords TMDB en inglés → señales fuertes (+2 profundo, -1 entretenimiento)
const KEYWORDS_PROFUNDO = [
  // Originales
  'symbolism', 'surrealism', 'existentialism', 'psychological',
  'art house', 'cult film', 'folk horror', 'grief', 'trauma',
  'allegory', 'metaphor', 'philosophical', 'experimental',
  'coming of age', 'identity', 'religion', 'mythology',
  'social commentary', 'dark comedy', 'anthology', 'dystopia',
  // Nuevas — cubren casos como El Origen, Vanilla Sky, Black Swan, etc.
  'consciousness', 'dream', 'surreal', 'nonlinear narrative',
  'mind-bending', 'memory', 'identity crisis', 'existential',
  'unreliable narrator', 'moral ambiguity', 'psychological thriller',
  'loss', 'redemption', 'isolation', 'obsession', 'guilt',
  'time manipulation', 'alternate reality', 'subconscious',
  'perception', 'illusion', 'paranoia', 'hallucination',
  'memory loss', 'virtual reality', 'parallel universe',
  'fate', 'free will', 'nihilism', 'solitude', 'despair',
  'doppelganger', 'mind control', 'self-discovery', 'madness',
  'collective memory', 'repressed memory', 'existential crisis',
  'philosophical fiction', 'psychological horror', 'dark past'
];

// Se quitaron 'heist' y 'adventure' — son señales demasiado neutras
const KEYWORDS_ENTRETENIMIENTO = [
  'superhero', 'action hero', 'blockbuster', 'sequel',
  'based on comic', 'marvel', 'dc comics', 'franchise',
  'buddy film', 'slapstick', 'parody', 'spoof',
  'family film', 'animation', 'summer blockbuster',
  'video game adaptation', 'based on toy', 'spin-off'
];

// Géneros TMDB en español → señal moderada (+1)
const GENEROS_PROFUNDO = [
  'Drama', 'Thriller psicológico', 'Terror', 'Misterio', 'Historia'
];

// ── Palabras en español buscadas en la SINOPSIS de TMDB ──────────────────────
// La sinopsis es la señal más directa del tono real de la película.
// Cap: máximo +3 desde sinopsis (evita que domine el score)
const SINOPSIS_PROFUNDO = [
  'identidad', 'realidad', 'sueño', 'conciencia', 'subconsciente',
  'percepción', 'ilusión', 'memoria', 'trauma', 'existencia',
  'filosófico', 'filosófica', 'distopía', 'distopia', 'redención',
  'culpa', 'obsesión', 'locura', 'manipulación', 'engaño',
  'dilema', 'alienación', 'corrupción', 'duelo', 'pérdida',
  'soledad', 'psicológico', 'psicológica', 'mente', 'destino',
  'moralidad', 'paranoia', 'alucinación', 'desdoblamiento',
  'libre albedrío', 'sentido de la vida', 'qué es real',
  'límite entre', 'línea entre', 'verdad oculta', 'secreto oscuro'
];

// Palabras en sinopsis que bajan el score (-0.5 cada una, cap -2)
const SINOPSIS_ENTRETENIMIENTO = [
  'salvar el mundo', 'salvar al mundo', 'superhéroe', 'súper héroe',
  'universo cinematográfico', 'aventura épica', 'misión imposible'
];

// Umbral subido a 3 porque ahora hay más señales disponibles
const UMBRAL_PROFUNDO = 3;

const clasificadorService = {

  /**
   * Clasifica una película como 'profundo' o 'entretenimiento'.
   *
   * @param {string[]} keywords    — Keywords en inglés de TMDB
   * @param {string[]} generos     — Géneros en español de TMDB
   * @param {string}   sinopsis    — Sinopsis en español de TMDB
   * @param {number}   calificacion — Vote average de TMDB (0-10)
   * @param {number}   duracion_min — Duración en minutos
   */
  clasificar(keywords = [], generos = [], sinopsis = '', calificacion = 0, duracion_min = 0) {
    let score     = 0;
    let kwScore   = 0;
    let genScore  = 0;
    let sinScore  = 0;
    let calScore  = 0;
    let durScore  = 0;

    // ── 1. Keywords TMDB ──────────────────────────────────────────
    const keywordsLower = keywords.map(k => k.toLowerCase());
    keywordsLower.forEach(k => {
      const palabras = k.split(/[\s,]+/);
      // Coincidencia exacta O una palabra del keyword coincide O substring
      if (KEYWORDS_PROFUNDO.some(kp => k === kp || palabras.includes(kp) || k.includes(kp))) {
        kwScore += 2;
      }
      if (KEYWORDS_ENTRETENIMIENTO.some(ke => k === ke || palabras.includes(ke) || k.includes(ke))) {
        kwScore -= 1;
      }
    });
    score += kwScore;

    // ── 2. Géneros ────────────────────────────────────────────────
    generos.forEach(g => {
      if (GENEROS_PROFUNDO.includes(g)) genScore += 1;
    });
    score += genScore;

    // ── 3. Sinopsis (señal más directa del tono real) ─────────────
    if (sinopsis) {
      const sinopsisLower = sinopsis.toLowerCase();
      let contadorProfundo = 0;
      let contadorEntret   = 0;

      SINOPSIS_PROFUNDO.forEach(palabra => {
        if (sinopsisLower.includes(palabra)) contadorProfundo++;
      });
      SINOPSIS_ENTRETENIMIENTO.forEach(palabra => {
        if (sinopsisLower.includes(palabra)) contadorEntret++;
      });

      sinScore += Math.min(contadorProfundo, 3);           // máx +3
      sinScore -= Math.min(contadorEntret * 0.5, 2);       // máx -2
      score    += sinScore;
    }

    // ── 4. Calificación TMDB (señal de calidad/complejidad) ───────
    // Alta calificación + otras señales tiende a indicar profundidad
    if      (calificacion >= 8.5) calScore = 2;
    else if (calificacion >= 7.5) calScore = 1;
    score += calScore;

    // ── 5. Duración (películas > 130 min rara vez son superficiales)
    if      (duracion_min >= 150) durScore = 2;
    else if (duracion_min >= 130) durScore = 1;
    score += durScore;

    const resultado = score >= UMBRAL_PROFUNDO ? 'profundo' : 'entretenimiento';

    // Log de diagnóstico — útil para probar casos como Vanilla Sky, El Origen
    console.log(
      `[Clasificador] "${resultado.toUpperCase()}" | Score: ${score.toFixed(1)} ` +
      `| kw: ${kwScore} | gén: ${genScore} | sin: ${sinScore.toFixed(1)} ` +
      `| cal(${calificacion}): ${calScore} | dur(${duracion_min}min): ${durScore}`
    );

    return resultado;
  }

};

module.exports = clasificadorService;
