const env = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = env.GROQ_API_KEY;
const GROQ_MODEL = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const geminiService = {

  construirPrompt(pelicula, tipo) {
    const keywords = Array.isArray(pelicula.keywords)
      ? pelicula.keywords.join(', ')
      : (typeof pelicula.keywords === 'string' ? pelicula.keywords : JSON.parse(pelicula.keywords || '[]').join(', '));

    const lineasBase = [
      `Película: "${pelicula.titulo}" (${pelicula.anio})`,
      `Director: ${pelicula.director}`,
      pelicula.guionista     ? `Guionista: ${pelicula.guionista}` : null,
      pelicula.dp            ? `Director de Fotografía: ${pelicula.dp}` : null,
      pelicula.compositor    ? `Compositor: ${pelicula.compositor}` : null,
      `Sinopsis: ${pelicula.sinopsis}`,
      `Calificación TMDB: ${pelicula.calificacion}/10`,
      pelicula.duracion      ? `Duración: ${pelicula.duracion}` : null,
      pelicula.presupuesto   ? `Presupuesto: ${pelicula.presupuesto}` : null,
      pelicula.recaudacion   ? `Recaudación mundial: ${pelicula.recaudacion}` : null,
      pelicula.reparto       ? `Reparto principal: ${pelicula.reparto}` : null,
      pelicula.paises        ? `Países de producción: ${pelicula.paises}` : null,
      pelicula.productoras   ? `Productoras: ${pelicula.productoras}` : null,
      pelicula.similares     ? `Películas similares: ${pelicula.similares}` : null,
      keywords               ? `Keywords: ${keywords}` : null,
    ].filter(Boolean);

    const base = lineasBase.join('\n');

    const instruccionesGenerales = `
INSTRUCCIONES GENERALES (OBLIGATORIAS):
- Responde SOLO con JSON válido y perfectamente parseable.
- NO uses markdown, NO agregues texto fuera del JSON, NO uses comas finales.
- NO inventes datos específicos como cifras exactas, premios reales o declaraciones textuales de personas.
- Si no estás seguro de un dato, infiere con criterio sin afirmarlo como hecho absoluto.
- NO repitas ideas entre secciones — cada bloque debe aportar información nueva y diferente.
- Mantén coherencia global en todo el análisis.
- Escribe en español latino, natural y fluido.`;

    if (tipo === 'profundo') {
      return `${base}
${instruccionesGenerales}

ROL: Eres un crítico cinematográfico y ensayista cultural de élite. Escribes para personas que aman el cine de verdad y quieren entender qué hay debajo de la superficie. Tu estilo mezcla el rigor de un académico con la pasión de un cinéfilo.

TONO: Analítico, evocador e intelectual pero accesible. Piensa en un video ensayo de YouTube sobre cine de autor — profundo pero apasionante. Usa frases variadas, mezcla oraciones cortas e impactantes con análisis más desarrollados. Evita frases genéricas y lugares comunes.

OBJETIVO: Que el lector sienta que entiende la película a un nivel que nunca había tenido. No cuentes la trama — analiza el PORQUÉ de cada decisión del director. Usa los datos reales del reparto, director de fotografía y compositor cuando estén disponibles para hacer el análisis más específico.

Responde SOLO con este JSON sin comentarios ni texto adicional:

{
  "narrativa": {
    "intro": "Gancho filosófico potente que conecte la premisa del film con una verdad humana universal (2-3 oraciones)",
    "secciones": [
      {
        "titulo": "Título analítico atractivo",
        "texto": "Análisis profundo del conflicto interno del protagonista usando psicología o filosofía aplicada a la narrativa (120-150 palabras)",
        "cita": {
          "texto": "Frase poderosa que capture la esencia temática",
          "fuente": "Personaje o director"
        }
      },
      {
        "titulo": "Título sobre el lenguaje visual",
        "texto": "Cómo la puesta en escena y el cromatismo refuerzan el tema central. Menciona al director de fotografía si está disponible (120-150 palabras)"
      },
      {
        "titulo": "Título sobre el subtexto",
        "texto": "Qué representan realmente los elementos simbólicos y qué quería decir el director (120-150 palabras)"
      }
    ]
  },
  "simbolismo": [
    { "icono": "fas fa-eye", "titulo": "Símbolo visual específico de esta película", "texto": "Interpretación profunda de su significado oculto (70-80 palabras)" },
    { "icono": "fas fa-ghost", "titulo": "Símbolo del trauma o conflicto", "texto": "Cómo se manifiesta el conflicto interior en elementos físicos (70-80 palabras)" },
    { "icono": "fas fa-door-open", "titulo": "Símbolo espacial o ambiental", "texto": "Los escenarios como extensiones del estado mental de los personajes (70-80 palabras)" },
    { "icono": "fas fa-skull", "titulo": "Símbolo de la mortalidad o transformación", "texto": "El tratamiento de la finitud o el miedo en la obra (70-80 palabras)" }
  ],
  "momentos": [
    { "tiempo": "Apertura", "color": "red", "tag": "Inicio", "titulo": "El primer golpe narrativo", "texto": "El elemento en los primeros minutos que establece el tono filosófico de toda la obra (70-80 palabras)" },
    { "tiempo": "Punto de inflexión", "color": "yellow", "tag": "Giro", "titulo": "El momento que lo cambia todo", "texto": "La escena donde el protagonista cruza el punto de no retorno (70-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Cumbre", "titulo": "La revelación final", "texto": "El momento donde toda la simbología y el subtexto convergen (70-80 palabras)" }
  ],
  "contexto": {
    "intro": "La obra en su corriente artística y momento histórico (2-3 oraciones)",
    "items": [
      { "icono": "fas fa-history", "titulo": "Movimiento o Corriente", "texto": "A qué corriente cinematográfica pertenece o desafía (70-80 palabras)" },
      { "icono": "fas fa-fingerprint", "titulo": "Sello de Autor", "texto": "Obsesiones temáticas o visuales recurrentes del director en esta obra (70-80 palabras)" },
      { "icono": "fas fa-bolt", "titulo": "Impacto Cultural", "texto": "Cómo cambió el género o la percepción del público tras su estreno (70-80 palabras)" }
    ]
  },
  "tecnica": {
    "intro": "El estilo técnico del director en esta obra (2-3 oraciones)",
    "aspectos": [
      { "titulo": "Cromatismo y Lenguaje Visual", "texto": "Uso psicológico del color y la composición de planos (90-100 palabras)" },
      { "titulo": "Paisaje Sonoro y Música", "texto": "Cómo el sonido y la banda sonora manipulan la emoción del espectador (90-100 palabras)" },
      { "titulo": "Estructura y Montaje", "texto": "El ritmo narrativo y qué dice el montaje sobre la historia (90-100 palabras)" }
    ]
  },
  "conclusion": "Cierre magistral sobre por qué esta película es indispensable. Termina con una frase poderosa de máximo 15 palabras. (180-200 palabras)"
}`;
    }

    return `${base}
${instruccionesGenerales}

ROL: Eres un insider de Hollywood y experto en cultura pop cinematográfica. Conoces todos los secretos del set, los datos de taquilla y las historias detrás de las cámaras que el público general no sabe. Usa los datos reales del reparto y producción disponibles para hacer el análisis más específico y creíble.

TONO: Vibrante, dinámico y lleno de energía. Estilo contenido viral de YouTube de curiosidades cinematográficas. Directo, llamativo, con ritmo rápido. Prioriza el factor sorpresa y el dato concreto.

OBJETIVO: Que el usuario quiera ver la película de nuevo para encontrar lo que no vio antes.

Responde SOLO con este JSON sin comentarios ni texto adicional:

{
  "resumen": {
    "intro": "Gancho electrizante sobre por qué esta película es especial y su impacto en la cultura pop (3 oraciones potentes)",
    "puntos": [
      { "titulo": "Récord o Hazaña:", "texto": "Dato numérico o técnico impresionante sobre la producción o impacto" },
      { "titulo": "El Factor X:", "texto": "Qué la hace única e irrepetible frente a otras películas del mismo género" },
      { "titulo": "Recepción Brutal:", "texto": "Cómo reaccionó la crítica o el público de forma inesperada o contradictoria" },
      { "titulo": "Legado Viral:", "texto": "Su impacto en memes, referencias culturales o el cine posterior" }
    ]
  },
  "momentos": [
    { "tiempo": "Apertura", "color": "red", "tag": "Hook", "titulo": "El detalle inicial que predice todo", "texto": "El elemento en los primeros minutos que anticipa el giro final sin que nadie lo note (70-80 palabras)" },
    { "tiempo": "Primer Acto", "color": "yellow", "tag": "Secret", "titulo": "La magia accidental", "texto": "Una escena que surgió por accidente o improvisación y terminó siendo icónica (70-80 palabras)" },
    { "tiempo": "Segundo Acto", "color": "cyan", "tag": "Mind-blow", "titulo": "La pista que nadie ve", "texto": "El frame u objeto que explica el giro y está ahí desde el principio (70-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Epic", "titulo": "El reto imposible del rodaje", "texto": "Lo difícil o peligroso que fue grabar la escena más importante (70-80 palabras)" }
  ],
  "easter_eggs": [
    { "titulo": "El cameo invisible", "texto": "Quién aparece escondido o qué objeto de otra película aparece de fondo (70-80 palabras)" },
    { "titulo": "El homenaje secreto", "texto": "A qué obra clásica le rinde homenaje de forma que solo los atentos notarían (70-80 palabras)" },
    { "titulo": "El código visual", "texto": "Un patrón visual repetitivo y qué comunica cada vez que aparece en pantalla (70-80 palabras)" }
  ],
  "curiosidades": [
    { "icono": "fas fa-mask", "titulo": "Casi ocurre...", "texto": "El actor que rechazó el papel principal o el final alternativo descartado (70-80 palabras)" },
    { "icono": "fas fa-tools", "titulo": "Efectos que sorprenden", "texto": "Algo que parece digital pero se construyó físicamente en el set (70-80 palabras)" },
    { "icono": "fas fa-skull-crossbones", "titulo": "El set maldito", "texto": "Las anécdotas más extrañas o peligrosas durante el rodaje (70-80 palabras)" },
    { "icono": "fas fa-award", "titulo": "Justicia poética", "texto": "El premio inesperado o el dato de taquilla más absurdo (70-80 palabras)" }
  ]
}`;
  },

 async generarAnalisis(pelicula, tipo) {
    const prompt = this.construirPrompt(pelicula, tipo);
    const inicio = Date.now();

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente que responde ÚNICAMENTE con JSON válido y parseable. Nunca uses comillas dentro de los valores de texto. Usa solo comillas dobles para las claves y valores del JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        top_p: 0.9,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Error Groq: ${err.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const texto = data.choices[0]?.message?.content || '';
    const tiempo_ms = Date.now() - inicio;

    let jsonLimpio = texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const inicioJson = jsonLimpio.indexOf('{');
    const finJson = jsonLimpio.lastIndexOf('}');
    if (inicioJson !== -1 && finJson !== -1) {
      jsonLimpio = jsonLimpio.substring(inicioJson, finJson + 1);
    }

    let capas;
    try {
      capas = JSON.parse(jsonLimpio);
    } catch (e) {
      // Limpiar caracteres problemáticos y reintentar
      jsonLimpio = jsonLimpio
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/,(\s*[}\]])/g, '$1');

      try {
        capas = JSON.parse(jsonLimpio);
      } catch (e2) {
        console.error('JSON inválido posición:', e2.message);
        console.error('Fragmento problemático:', jsonLimpio.substring(2700, 2800));
        throw new Error('Respuesta de IA con formato inválido. Intenta de nuevo.');
      }
    }

    return { capas, prompt, tiempo_ms };
  }

};

module.exports = geminiService;