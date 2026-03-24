const env = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = env.GROQ_API_KEY;
const GROQ_MODEL = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const geminiService = {

  construirPrompt(pelicula, tipo) {
    const base = `Película: "${pelicula.titulo}" (${pelicula.anio})
Director: ${pelicula.director}
Sinopsis: ${pelicula.sinopsis}
Calificación: ${pelicula.calificacion}/10`;

    if (tipo === 'profundo') {
      return `${base}

Eres un crítico de cine especializado en cine de autor. Genera un análisis cinematográfico profundo en español con exactamente estas 5 secciones en formato JSON:

{
  "narrativa": "Análisis de la estructura narrativa, arcos de personajes y construcción dramática (150-200 palabras)",
  "simbolismo": "Análisis del simbolismo visual, metáforas y elementos alegóricos (150-200 palabras)",
  "contexto": "Contexto cultural, histórico y relación con la filmografía del director (150-200 palabras)",
  "tecnica": "Análisis técnico: fotografía, música, dirección de arte y montaje (150-200 palabras)",
  "conclusion": "Lectura final e impacto en el cine contemporáneo (100-150 palabras)"
}

Responde SOLO con el JSON, sin texto adicional.`;
    }

    return `${base}

Eres un crítico de cine especializado en cine de entretenimiento. Genera un análisis en español con exactamente estas 4 secciones en formato JSON:

{
  "resumen": "Resumen sin spoilers destacando lo mejor de la película (150-200 palabras)",
  "momentos": "Los 3 momentos más épicos o memorables de la película (150-200 palabras)",
  "easter_eggs": "Easter eggs, referencias ocultas y guiños para los fans (100-150 palabras)",
  "curiosidades": "Curiosidades del rodaje y datos de producción interesantes (100-150 palabras)"
}

Responde SOLO con el JSON, sin texto adicional.`;
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