const env = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = env.GROQ_API_KEY;
const GROQ_MODEL = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const geminiService = {

  /**
   * Procesa las keywords para asegurar que siempre sea un string legible.
   */
  formatearKeywords(keywords) {
    if (Array.isArray(keywords)) return keywords.join(', ');
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords);
        return Array.isArray(parsed) ? parsed.join(', ') : keywords;
      } catch (e) {
        return keywords;
      }
    }
    return '';
  },

  construirPrompt(pelicula, tipo) {
    const keywords = this.formatearKeywords(pelicula.keywords);

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
INSTRUCCIONES DE FORMATO (CRÍTICAS):
- Responde ÚNICAMENTE con JSON válido.
- Si necesitas usar comillas dentro del texto, usa comillas simples (' ') para no romper la estructura JSON.
- NO uses markdown, NO incluyas texto explicativo fuera del objeto.
- NO inventes premios o citas textuales si no tienes la certeza; prefiere el análisis conceptual.
- Evita repeticiones: cada sección debe aportar un ángulo nuevo.
- Idioma: Español latino natural y fluido.`;

    if (tipo === 'profundo') {
      return `${base}
${instruccionesGenerales}

ROL: Crítico cinematográfico y ensayista cultural de élite. Estilo tipo video-ensayo de cine de autor.
TONO: Intelectual, evocador y profundo. Analiza el PORQUÉ detrás de la cámara.
OBJETIVO: Revelar el subtexto y la simbología oculta de la obra.

JSON Schema:
{
  "narrativa": {
    "intro": "Gancho filosófico sobre el tema central (2-3 oraciones)",
    "secciones": [
      {
        "titulo": "Título analítico",
        "texto": "Análisis del conflicto interno y arquetipos (120-150 palabras)",
        "cita": { "texto": "Frase que resuma el tema", "fuente": "Director o personaje" }
      },
      { "titulo": "El Lenguaje de la Imagen", "texto": "Análisis de la puesta en escena y el trabajo del DP si está disponible (120-150 palabras)" },
      { "titulo": "Metáfora y Subtexto", "texto": "Significado real de la trama y mensaje del autor (120-150 palabras)" }
    ]
  },
  "simbolismo": [
    { "icono": "fas fa-eye", "titulo": "Símbolo visual", "texto": "Interpretación del motivo recurrente (70-80 palabras)" },
    { "icono": "fas fa-ghost", "titulo": "Símbolo del trauma", "texto": "Manifestación física de conflictos internos (70-80 palabras)" },
    { "icono": "fas fa-door-open", "titulo": "Símbolo espacial", "texto": "Escenarios como estados mentales (70-80 palabras)" },
    { "icono": "fas fa-skull", "titulo": "Símbolo de transformación", "texto": "Miedo o evolución en la obra (70-80 palabras)" }
  ],
  "momentos": [
    { "tiempo": "Apertura", "color": "red", "tag": "Inicio", "titulo": "El primer golpe", "texto": "Establecimiento del tono filosófico (70-80 palabras)" },
    { "tiempo": "Inflexión", "color": "yellow", "tag": "Giro", "titulo": "El cruce del umbral", "texto": "El punto de no retorno narrativo (70-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Cumbre", "titulo": "La catarsis", "texto": "Convergencia de toda la simbología (70-80 palabras)" }
  ],
  "contexto": {
    "intro": "Ubicación histórica y artística de la obra.",
    "items": [
      { "icono": "fas fa-history", "titulo": "Corriente", "texto": "Relación con movimientos cinematográficos." },
      { "icono": "fas fa-fingerprint", "titulo": "Sello de Autor", "texto": "Obsesiones recurrentes del director en este film." },
      { "icono": "fas fa-bolt", "titulo": "Impacto", "texto": "Cómo cambió el género tras su estreno." }
    ]
  },
  "tecnica": {
    "intro": "Análisis del despliegue técnico.",
    "aspectos": [
      { "titulo": "Cromatismo", "texto": "Psicología del color (90-100 palabras)" },
      { "titulo": "Sonido y Música", "texto": "Análisis de la atmósfera sonora (90-100 palabras)" },
      { "titulo": "Montaje", "texto": "Ritmo y estructura temporal (90-100 palabras)" }
    ]
  },
  "conclusion": "Reflexión final poderosa sobre el legado de la película. Termina con una frase de impacto (máximo 15 palabras). (180-200 palabras)"
}`;
    }

    return `${base}
${instruccionesGenerales}

ROL: Insider de Hollywood y experto en cultura pop. Estilo contenido viral de curiosidades.
TONO: Vibrante, dinámico y sorprendente. "Wow factors" constantes.
OBJETIVO: Revelar secretos de producción, easter eggs y datos que nadie notó.

JSON Schema:
{
  "resumen": {
    "intro": "Gancho electrizante sobre el impacto pop de la película (3 oraciones)",
    "puntos": [
      { "titulo": "Récord:", "texto": "Dato numérico o técnico asombroso." },
      { "titulo": "Factor X:", "texto": "Lo que la hace única e irrepetible." },
      { "titulo": "Recepción:", "texto": "Reacción inesperada del público o crítica." },
      { "titulo": "Legado:", "texto": "Huella en memes o cultura actual." }
    ]
  },
  "momentos": [
    { "tiempo": "Apertura", "color": "red", "tag": "Hook", "titulo": "Predicción oculta", "texto": "El detalle que anticipa el final (70-80 palabras)" },
    { "tiempo": "Acto 1", "color": "yellow", "tag": "Secret", "titulo": "Magia accidental", "texto": "Improvisación icónica (70-80 palabras)" },
    { "tiempo": "Acto 2", "color": "cyan", "tag": "Mind-blow", "titulo": "La pista invisible", "texto": "El objeto que explica el giro (70-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Epic", "titulo": "Rodaje extremo", "texto": "Dificultades reales de la escena final (70-80 palabras)" }
  ],
  "easter_eggs": [
    { "titulo": "Cameo", "texto": "Quién aparece escondido (70-80 palabras)" },
    { "titulo": "Homenaje", "texto": "Referencia secreta a un clásico (70-80 palabras)" },
    { "titulo": "Patrón Visual", "texto": "Código de colores o formas ocultas (70-80 palabras)" }
  ],
  "curiosidades": [
    { "icono": "fas fa-mask", "titulo": "Casi ocurre...", "texto": "Actores rechazados o finales alternativos." },
    { "icono": "fas fa-tools", "titulo": "FX Reales", "texto": "Efectos prácticos que parecen digitales." },
    { "icono": "fas fa-skull-crossbones", "titulo": "Set Maldito", "texto": "Anécdotas extrañas del rodaje." },
    { "icono": "fas fa-award", "titulo": "Dato Loco", "texto": "Curiosidad de taquilla o premios absurda." }
  ]
}`;
  },

  async generarAnalisis(pelicula, tipo) {
    const prompt = this.construirPrompt(pelicula, tipo);
    const inicio = Date.now();

    // Ajuste dinámico de temperatura según el modo
    const temp = tipo === 'profundo' ? 0.7 : 0.85;

    try {
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
              content: 'Eres un experto analista cinematográfico. Responde EXCLUSIVAMENTE con el objeto JSON solicitado.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: temp,
          top_p: 0.9,
          max_tokens: 3000, // Aumentado para evitar cortes en conclusiones largas
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`Error Groq: ${err.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      const texto = data.choices[0]?.message?.content || '';
      const tiempo_ms = Date.now() - inicio;

      // Limpieza robusta del JSON
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
        // Segundo intento: Limpieza de caracteres de control y comas finales
        jsonLimpio = jsonLimpio
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .replace(/,(\s*[}\]])/g, '$1');
        
        capas = JSON.parse(jsonLimpio);
      }

      return { capas, prompt, tiempo_ms };

    } catch (error) {
      console.error('Error en generarAnalisis:', error.message);
      throw error;
    }
  }

};

module.exports = geminiService;