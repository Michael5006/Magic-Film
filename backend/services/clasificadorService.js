const KEYWORDS_PROFUNDO = [
  'symbolism', 'surrealism', 'existentialism', 'psychological',
  'art house', 'cult film', 'folk horror', 'grief', 'trauma',
  'allegory', 'metaphor', 'philosophical', 'experimental',
  'coming of age', 'identity', 'religion', 'mythology',
  'social commentary', 'dark comedy', 'anthology', 'dystopia'
];

const KEYWORDS_ENTRETENIMIENTO = [
  'superhero', 'action hero', 'blockbuster', 'sequel',
  'based on comic', 'marvel', 'dc comics', 'franchise',
  'buddy film', 'heist', 'slapstick', 'parody', 'spoof',
  'family film', 'animation', 'adventure', 'summer blockbuster'
];

const GENEROS_PROFUNDO = [
  'Drama', 'Thriller psicológico', 'Terror', 'Misterio'
];

const UMBRAL_PROFUNDO = 2;

const clasificadorService = {

  clasificar(keywords = [], generos = []) {
    let score = 0;

    // Analizar keywords
    const keywordsLower = keywords.map(k => k.toLowerCase());
    
    keywordsLower.forEach(k => {
      if (KEYWORDS_PROFUNDO.some(kp => k.includes(kp))) score += 2;
      if (KEYWORDS_ENTRETENIMIENTO.some(ke => k.includes(ke))) score -= 1;
    });

    // Analizar géneros
    generos.forEach(g => {
      if (GENEROS_PROFUNDO.includes(g)) score += 1;
    });

    return score >= UMBRAL_PROFUNDO ? 'profundo' : 'entretenimiento';
  }

};

module.exports = clasificadorService;