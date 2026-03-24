const env = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = env.GROQ_API_KEY;
const GROQ_MODEL = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const geminiService = {

construirPrompt(pelicula, tipo) {
    const keywords = Array.isArray(pelicula.keywords)
      ? pelicula.keywords.join(', ')
      : JSON.parse(pelicula.keywords || '[]').join(', ');

    const base = `Película: "${pelicula.titulo}" (${pelicula.anio})
Director: ${pelicula.director}
Sinopsis: ${pelicula.sinopsis}
Calificación: ${pelicula.calificacion}/10
Keywords: ${keywords}`;

    if (tipo === 'profundo') {
      return `${base}

Eres el mejor crítico de cine hispanohablante. Genera un análisis PROFUNDO y DETALLADO en español.
Responde SOLO con este JSON exacto, sin texto adicional, sin markdown:

{
  "narrativa": {
    "intro": "Párrafo de introducción impactante sobre el tema central de la película (2-3 oraciones)",
    "secciones": [
      {
        "titulo": "Título de la primera sección narrativa",
        "texto": "Análisis detallado de este aspecto narrativo (100-150 palabras)",
        "cita": { "texto": "Cita relevante de crítica o del film", "fuente": "Fuente de la cita" }
      },
      {
        "titulo": "Título de la segunda sección",
        "texto": "Análisis detallado (100-150 palabras)"
      },
      {
        "titulo": "Título de la tercera sección",
        "texto": "Análisis detallado (100-150 palabras)"
      }
    ]
  },
  "simbolismo": [
    { "icono": "fas fa-sun", "titulo": "Nombre del símbolo", "texto": "Explicación del simbolismo (60-80 palabras)" },
    { "icono": "fas fa-eye", "titulo": "Nombre del símbolo", "texto": "Explicación del simbolismo (60-80 palabras)" },
    { "icono": "fas fa-fire", "titulo": "Nombre del símbolo", "texto": "Explicación del simbolismo (60-80 palabras)" },
    { "icono": "fas fa-moon", "titulo": "Nombre del símbolo", "texto": "Explicación del simbolismo (60-80 palabras)" }
  ],
  "contexto": {
    "intro": "Párrafo introductorio del contexto (2-3 oraciones)",
    "items": [
      { "icono": "fas fa-film", "titulo": "Dato de contexto 1", "texto": "Explicación detallada (60-80 palabras)" },
      { "icono": "fas fa-globe", "titulo": "Dato de contexto 2", "texto": "Explicación detallada (60-80 palabras)" },
      { "icono": "fas fa-cut", "titulo": "Dato de contexto 3", "texto": "Explicación detallada (60-80 palabras)" }
    ]
  },
  "tecnica": {
    "intro": "Párrafo sobre el estilo técnico general del director (2-3 oraciones)",
    "aspectos": [
      { "titulo": "Fotografía y Paleta Visual", "texto": "Análisis de la fotografía y colores (80-100 palabras)" },
      { "titulo": "Diseño Sonoro y Música", "texto": "Análisis del sonido y banda sonora (80-100 palabras)" },
      { "titulo": "Montaje y Ritmo", "texto": "Análisis del montaje y estructura temporal (80-100 palabras)" }
    ]
  },
  "conclusion": "Párrafo final poderoso sobre el legado e impacto de la película. Por qué importa. Termina con una frase memorable. (150-200 palabras)"
}`;
    }

    return `${base}

Eres un crítico de entretenimiento cinematográfico. Genera un análisis entretenido con datos reales en español.
Responde SOLO con este JSON exacto, sin texto adicional, sin markdown:

{
  "resumen": {
    "intro": "Párrafo de gancho sobre qué hace especial esta película, datos de taquilla y su lugar en la cultura pop (2-3 oraciones impactantes)",
    "puntos": [
      { "titulo": "Dato o punto interesante 1:", "texto": "Explicación del punto con datos concretos" },
      { "titulo": "Dato o punto interesante 2:", "texto": "Explicación del punto con datos concretos" },
      { "titulo": "Dato o punto interesante 3:", "texto": "Explicación del punto con datos concretos" },
      { "titulo": "Dato o punto interesante 4:", "texto": "Explicación del punto con datos concretos" }
    ]
  },
  "momentos": [
    { "tiempo": "Inicio", "color": "red", "tag": "Apertura", "titulo": "Nombre del primer momento memorable", "texto": "Por qué este momento establece el tono de toda la película (60-80 palabras)" },
    { "tiempo": "Primer acto", "color": "yellow", "tag": "Desarrollo", "titulo": "Nombre del segundo momento", "texto": "Descripción y por qué es importante (60-80 palabras)" },
    { "tiempo": "Segundo acto", "color": "cyan", "tag": "Giro", "titulo": "Nombre del giro principal", "texto": "El momento que cambia todo (60-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Final", "titulo": "Nombre del momento climático", "texto": "El cierre memorable de la película (60-80 palabras)" }
  ],
  "easter_eggs": [
    { "titulo": "Nombre del easter egg 1", "texto": "Descripción detallada de dónde encontrarlo y su significado (60-80 palabras)" },
    { "titulo": "Nombre del easter egg 2", "texto": "Descripción detallada (60-80 palabras)" },
    { "titulo": "Nombre del easter egg 3", "texto": "Descripción detallada (60-80 palabras)" }
  ],
  "curiosidades": [
    { "icono": "fas fa-dollar-sign", "titulo": "Título curiosidad 1", "texto": "Dato sorprendente con números concretos (60-80 palabras)" },
    { "icono": "fas fa-film", "titulo": "Título curiosidad 2", "texto": "Dato sorprendente (60-80 palabras)" },
    { "icono": "fas fa-users", "titulo": "Título curiosidad 3", "texto": "Dato sorprendente (60-80 palabras)" },
    { "icono": "fas fa-trophy", "titulo": "Título curiosidad 4", "texto": "Dato sorprendente (60-80 palabras)" }
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
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Error Groq: ${err.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const texto = data.choices[0]?.message?.content || '';
    const tiempo_ms = Date.now() - inicio;

    const jsonLimpio = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const capas = JSON.parse(jsonLimpio);

    return { capas, prompt, tiempo_ms };
  }

};

module.exports = geminiService;