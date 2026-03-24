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
${pelicula.guionista ? `Guionista: ${pelicula.guionista}` : ''}
${pelicula.dp ? `Director de Fotografía: ${pelicula.dp}` : ''}
${pelicula.compositor ? `Compositor: ${pelicula.compositor}` : ''}
Sinopsis: ${pelicula.sinopsis}
Calificación TMDB: ${pelicula.calificacion}/10
${pelicula.duracion ? `Duración: ${pelicula.duracion}` : ''}
${pelicula.presupuesto ? `Presupuesto: ${pelicula.presupuesto}` : ''}
${pelicula.recaudacion ? `Recaudación mundial: ${pelicula.recaudacion}` : ''}
${pelicula.reparto ? `Reparto principal: ${pelicula.reparto}` : ''}
${pelicula.paises ? `Países de producción: ${pelicula.paises}` : ''}
${pelicula.productoras ? `Productoras: ${pelicula.productoras}` : ''}
${pelicula.similares ? `Películas similares: ${pelicula.similares}` : ''}
Keywords: ${pelicula.keywords || keywords}`;

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
        "texto": "Cómo la puesta en escena y el cromatismo refuerzan el tema central (120-150 palabras)"
      },
      {
        "titulo": "Título sobre el subtexto",
        "texto": "Qué representan realmente los elementos simbólicos y qué quería decir el director (120-150 palabras)"
      }
    ]
  },
  "simbolismo": [
    { "icono": "fas fa-eye", "titulo": "Símbolo visual específico", "texto": "Interpretación profunda de su significado oculto (70-80 palabras)" },
    { "icono": "fas fa-ghost", "titulo": "Símbolo del trauma", "texto": "Cómo se manifiesta el conflicto interior en elementos físicos (70-80 palabras)" },
    { "icono": "fas fa-door-open", "titulo": "Símbolo espacial", "texto": "Los escenarios como extensiones del estado mental de los personajes (70-80 palabras)" },
    { "icono": "fas fa-skull", "titulo": "Símbolo de la mortalidad", "texto": "El tratamiento de la finitud o el miedo en la obra (70-80 palabras)" }
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
      { "icono": "fas fa-fingerprint", "titulo": "Sello de Autor", "texto": "Obsesiones del director presentes en esta obra (70-80 palabras)" },
      { "icono": "fas fa-bolt", "titulo": "Impacto Cultural", "texto": "Cómo cambió el género o la percepción del público (70-80 palabras)" }
    ]
  },
  "tecnica": {
    "intro": "El estilo técnico del director en esta obra (2-3 oraciones)",
    "aspectos": [
      { "titulo": "Cromatismo y Lenguaje Visual", "texto": "Uso psicológico del color y la composición de planos (90-100 palabras)" },
      { "titulo": "Paisaje Sonoro y Música", "texto": "Cómo el sonido manipula la emoción del espectador (90-100 palabras)" },
      { "titulo": "Estructura y Montaje", "texto": "El ritmo narrativo y qué dice el montaje sobre la historia (90-100 palabras)" }
    ]
  },
  "conclusion": "Cierre magistral sobre por qué esta película es indispensable. Termina con una frase poderosa de máximo 15 palabras. (180-200 palabras)"
}`;
    }

    return `${base}
${instruccionesGenerales}

ROL: Eres un insider de Hollywood y experto en cultura pop cinematográfica. Conoces todos los secretos del set, los datos de taquilla y las historias detrás de las cámaras que el público general no sabe.

TONO: Vibrante, dinámico y lleno de energía. Estilo contenido viral de YouTube de curiosidades cinematográficas. Directo, llamativo, con ritmo rápido. Prioriza el factor sorpresa.

OBJETIVO: Que el usuario quiera ver la película de nuevo para encontrar lo que no vio antes.

Responde SOLO con este JSON sin comentarios ni texto adicional:

{
  "resumen": {
    "intro": "Gancho electrizante sobre por qué esta película es especial y su impacto en la cultura pop (3 oraciones)",
    "puntos": [
      { "titulo": "Récord o Hazaña:", "texto": "Dato numérico o técnico impresionante sobre la producción" },
      { "titulo": "El Factor X:", "texto": "Qué la hace única frente a otras películas del mismo género" },
      { "titulo": "Recepción Brutal:", "texto": "Cómo reaccionó la crítica o el público de forma inesperada" },
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
    { "titulo": "El código visual", "texto": "Un patrón visual repetitivo y qué comunica cada vez que aparece (70-80 palabras)" }
  ],
  "curiosidades": [
    { "icono": "fas fa-mask", "titulo": "Casi ocurre...", "texto": "El actor que rechazó el papel o el final alternativo descartado (70-80 palabras)" },
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

    // Limpiar respuesta antes de parsear
    let jsonLimpio = texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    // Extraer solo el bloque JSON
    const inicioJson = jsonLimpio.indexOf('{');
    const finJson = jsonLimpio.lastIndexOf('}');
    if (inicioJson !== -1 && finJson !== -1) {
      jsonLimpio = jsonLimpio.substring(inicioJson, finJson + 1);
    }

    const capas = JSON.parse(jsonLimpio);

    return { capas, prompt, tiempo_ms };
  }

};

module.exports = geminiService;