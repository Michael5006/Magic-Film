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

OBJETIVO: Que el lector sienta que entiende la película a un nivel que nunca había tenido. No cuentes la trama — analiza el PORQUÉ de cada decisión del director.

Responde SOLO con este JSON:

{
  "narrativa": {
    "intro": "Gancho filosófico potente que conecte la premisa del film con una verdad humana universal. Debe ser intrigante y dejar al lector queriendo saber más. (2-3 oraciones)",
    "secciones": [
      {
        "titulo": "Título analítico atractivo que no sea genérico",
        "texto": "Análisis profundo de la arquitectura del conflicto interno del protagonista. Usa conceptos de psicología o filosofía aplicados a la narrativa. No resumas — interpreta. (120-150 palabras)",
        "cita": {
          "texto": "Una frase poderosa que capture la esencia temática — puede ser un diálogo del film o una reinterpretación",
          "fuente": "Personaje o director"
        }
      },
      {
        "titulo": "Título sobre el lenguaje visual",
        "texto": "Cómo la puesta en escena, el cromatismo y el ritmo refuerzan el tema central. Menciona decisiones visuales específicas del director. (120-150 palabras)"
      },
      {
        "titulo": "Título sobre el subtexto",
        "texto": "Qué representan realmente los elementos simbólicos, el antagonista o el entorno. Qué quería decir el director más allá de la superficie. (120-150 palabras)"
      }
    ]
  },
  "simbolismo": [
    { "icono": "fas fa-eye", "titulo": "Símbolo visual específico de esta película", "texto": "Interpretación profunda de su significado oculto y cómo se manifiesta en escenas concretas. (70-80 palabras)" },
    { "icono": "fas fa-ghost", "titulo": "Símbolo relacionado con el trauma o el pasado", "texto": "Cómo se manifiesta el conflicto interior en elementos físicos o narrativos. (70-80 palabras)" },
    { "icono": "fas fa-door-open", "titulo": "Símbolo espacial o ambiental", "texto": "Análisis del uso de los escenarios como extensiones del estado mental de los personajes. (70-80 palabras)" },
    { "icono": "fas fa-skull", "titulo": "Símbolo sobre la mortalidad o el miedo", "texto": "El tratamiento de la finitud, el miedo o la transformación en la obra. (70-80 palabras)" }
  ],
  "contexto": {
    "intro": "Situando la obra en su corriente artística y momento histórico. (2-3 oraciones)",
    "items": [
      { "icono": "fas fa-history", "titulo": "Movimiento o Corriente", "texto": "A qué corriente cinematográfica pertenece o desafía esta película. (70-80 palabras)" },
      { "icono": "fas fa-fingerprint", "titulo": "Sello de Autor", "texto": "Obsesiones temáticas o visuales recurrentes del director presentes en esta obra. (70-80 palabras)" },
      { "icono": "fas fa-bolt", "titulo": "Impacto Cultural", "texto": "Cómo esta película cambió el género, la percepción del público o influyó en obras posteriores. (70-80 palabras)" }
    ]
  },
  "tecnica": {
    "intro": "Visión general del estilo técnico del director en esta obra. (2-3 oraciones)",
    "aspectos": [
      { "titulo": "Cromatismo y Lenguaje Visual", "texto": "Uso psicológico del color, la iluminación y la composición de planos. Cómo cada decisión visual refuerza el tema. (90-100 palabras)" },
      { "titulo": "Paisaje Sonoro y Música", "texto": "Cómo el diseño de sonido y la banda sonora manipulan la emoción del espectador de forma casi imperceptible. (90-100 palabras)" },
      { "titulo": "Estructura y Montaje", "texto": "Análisis del ritmo narrativo, los cortes y la progresión temporal. Qué dice el montaje sobre la historia. (90-100 palabras)" }
    ]
  },
  "conclusion": "Cierre magistral que defina por qué esta película es indispensable en la historia del cine. Debe dejar al lector reflexionando sobre algo más allá de la película. Termina con una frase poderosa y memorable de máximo 15 palabras que funcione como epitafio del análisis. (180-200 palabras)"
}`;
  }

  return `${base}
${instruccionesGenerales}

ROL: Eres un insider de Hollywood y experto en cultura pop cinematográfica. Conoces todos los secretos del set, los datos de taquilla y las historias detrás de las cámaras que el público general no sabe. Escribes para personas que aman el cine pero quieren entretenerse aprendiendo.

TONO: Vibrante, dinámico y lleno de energía. Estilo contenido viral — piensa en un video de YouTube de curiosidades cinematográficas que no puedes dejar de ver. Directo, llamativo, con ritmo rápido. Usa lenguaje cercano y natural. Prioriza el factor sorpresa y el "no sabía eso".

OBJETIVO: Que el usuario termine el análisis con ganas de ver la película de nuevo para encontrar lo que no vio antes. Enfócate en datos de producción, improvisaciones, accidentes de rodaje y easter eggs difíciles de detectar.

Responde SOLO con este JSON:

{
  "resumen": {
    "intro": "Gancho electrizante sobre por qué esta película es especial, su impacto en taquilla o cultura pop y su estatus actual. Debe generar curiosidad inmediata. (3 oraciones potentes)",
    "puntos": [
      { "titulo": "Récord o Hazaña:", "texto": "Un dato numérico o técnico impresionante sobre la producción o impacto de la película." },
      { "titulo": "El Factor X:", "texto": "Qué la hace única e irrepetible frente a otras películas del mismo género." },
      { "titulo": "Recepción Brutal:", "texto": "Cómo reaccionó la crítica o el público de forma inesperada o contradictoria." },
      { "titulo": "Legado Viral:", "texto": "Su impacto en memes, referencias culturales, tendencias o el cine posterior." }
    ]
  },
  "momentos": [
    { "tiempo": "Apertura", "color": "red", "tag": "Hook", "titulo": "El detalle inicial que predice todo", "texto": "El elemento visual o narrativo en los primeros minutos que anticipa el giro final sin que nadie lo note la primera vez. (70-80 palabras)" },
    { "tiempo": "Primer Acto", "color": "yellow", "tag": "Secret", "titulo": "La magia accidental", "texto": "Una escena o detalle que surgió por accidente, improvisación o error y terminó siendo icónico. (70-80 palabras)" },
    { "tiempo": "Segundo Acto", "color": "cyan", "tag": "Mind-blow", "titulo": "La pista que nadie ve", "texto": "El frame, objeto o línea de diálogo que explica el giro de la trama y que está ahí desde el principio. (70-80 palabras)" },
    { "tiempo": "Clímax", "color": "purple", "tag": "Epic", "titulo": "El reto imposible del rodaje", "texto": "Lo extremadamente difícil, peligroso o costoso que fue grabar la escena más importante de la película. (70-80 palabras)" }
  ],
  "easter_eggs": [
    { "titulo": "El cameo o referencia invisible", "texto": "Quién aparece escondido, qué objeto de otra película aparece de fondo o qué guiño está enterrado en el decorado. (70-80 palabras)" },
    { "titulo": "El homenaje secreto", "texto": "A qué obra clásica o director le rinde homenaje esta película de forma que solo los más atentos notarían. (70-80 palabras)" },
    { "titulo": "El código visual", "texto": "Un patrón de color, símbolo o elemento visual repetitivo y qué comunica cada vez que aparece en pantalla. (70-80 palabras)" }
  ],
  "curiosidades": [
    { "icono": "fas fa-mask", "titulo": "Casi ocurre...", "texto": "El actor que rechazó el papel principal, el final alternativo que fue descartado o la película que casi no existe. (70-80 palabras)" },
    { "icono": "fas fa-tools", "titulo": "Efectos que sorprenden", "texto": "Algo que parece completamente digital o imposible pero que se construyó físicamente en el set de rodaje. (70-80 palabras)" },
    { "icono": "fas fa-skull-crossbones", "titulo": "El set maldito", "texto": "Las anécdotas más extrañas, peligrosas o inexplicables que ocurrieron durante el rodaje. (70-80 palabras)" },
    { "icono": "fas fa-award", "titulo": "Justicia poética", "texto": "El premio inesperado, el dato de taquilla más absurdo o el reconocimiento que llegó demasiado tarde o demasiado pronto. (70-80 palabras)" }
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
        temperature: 0.85,
        top_p: 0.9,
        max_tokens: 2500
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