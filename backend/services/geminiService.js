const env = require('../config/env');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = env.GROQ_API_KEY;

// Cadena de fallback: si el modelo principal llega al límite de tokens,
// se intenta con el siguiente automáticamente.
// Modelos activos en Groq (2026) con cuotas de tokens independientes.
const MODELOS_FALLBACK = [
  env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-120b',
];

// Extrae los segundos de espera del mensaje de error de Groq
function extraerSegundosEspera(mensaje) {
    const match = mensaje.match(/try again in ([\d.]+)s/i);
    return match ? Math.ceil(parseFloat(match[1])) + 1 : 0;
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const geminiService = {

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

  // media_type: 'movie' | 'tv'
  construirPrompt(pelicula, tipo, media_type = 'movie') {
    const keywords = this.formatearKeywords(pelicula.keywords);
    const esTV     = media_type === 'tv';

    // Etiquetas dinámicas centralizadas — un solo lugar para cambiar textos
    const etiquetas = {
      obra:          esTV ? 'Serie'              : 'Película',
      director:      esTV ? 'Creador/es'         : 'Director',
      similares:     esTV ? 'Series similares'   : 'Películas similares',
      duracionLabel: esTV ? 'Duración por ep.'   : 'Duración',
      produccion:    esTV ? 'producción de la serie' : 'rodaje',
      legado:        esTV ? 'legado de la serie'  : 'legado de la película',
      insider:       esTV ? 'Insider de la industria televisiva y experto en cultura pop' 
                          : 'Insider de Hollywood y experto en cultura pop',
    };

    const lineasBase = [
      `${etiquetas.obra}: "${pelicula.titulo}" (${pelicula.anio})`,
      `${etiquetas.director}: ${pelicula.director}`,
      pelicula.guionista   ? `Guionista: ${pelicula.guionista}`          : null,
      // DP solo aplica a películas
      (!esTV && pelicula.dp) ? `Director de Fotografía: ${pelicula.dp}` : null,
      pelicula.compositor  ? `Compositor: ${pelicula.compositor}`        : null,
      `Sinopsis: ${pelicula.sinopsis}`,
      `Calificación TMDB: ${pelicula.calificacion}/10`,
      pelicula.duracion    ? `${etiquetas.duracionLabel}: ${pelicula.duracion}` : null,
      // Temporadas/episodios — solo para series
      esTV && pelicula.temporadas ? `Temporadas: ${pelicula.temporadas}` : null,
      esTV && pelicula.episodios  ? `Episodios totales: ${pelicula.episodios}` : null,
      // Presupuesto/recaudación — solo para películas (TMDB no lo tiene para TV)
      (!esTV && pelicula.presupuesto) ? `Presupuesto: ${pelicula.presupuesto}`              : null,
      (!esTV && pelicula.recaudacion) ? `Recaudación mundial: ${pelicula.recaudacion}`      : null,
      pelicula.repartoTexto  ? `Reparto principal: ${pelicula.repartoTexto}`                : null,
      pelicula.paises        ? `Países de producción: ${pelicula.paises}`                   : null,
      pelicula.productoras   ? `Productoras: ${pelicula.productoras}`                       : null,
      pelicula.similaresTexto ? `${etiquetas.similares}: ${pelicula.similaresTexto}`        : null,
      keywords               ? `Keywords: ${keywords}`                                       : null,
    ].filter(Boolean);

    const base = lineasBase.join('\n');

    const instruccionesGenerales = `
INSTRUCCIONES DE FORMATO (CRÍTICAS):
- Responde ÚNICAMENTE con JSON válido.
- Si necesitas usar comillas dentro del texto, usa comillas simples (' ') para no romper la estructura JSON.
- NO uses markdown, NO incluyas texto explicativo fuera del objeto.
- NO inventes premios o citas textuales si no tienes la certeza; prefiere el análisis conceptual.
- Evita repeticiones: cada sección debe aportar un ángulo nuevo.
- DETECTIVE VISUAL: Analiza pistas mínimas (Indaga en la pelicula y recopila información clave) que sugieran finales ocultos o teorías fan.
- Idioma: Español latino natural y fluido.`;


   if (tipo === 'profundo') {
  return `${base}
${instruccionesGenerales}

ROL: Analista ${esTV ? 'audiovisual' : 'cinematográfico'} de élite y detective de guiones. No eres un resumen — eres un investigador que encuentra lo que otros ignoran.
TONO: Intelectual, crítico y apasionado. Tomas posturas. Defiendes interpretaciones. Presentas evidencia.
OBJETIVO: Descifrar el subtexto, resolver ambigüedades del final y proponer teorías basadas en pistas visuales y narrativas concretas de esta ${etiquetas.obra.toLowerCase()}.
OBJETIVO 2: Resolver ambigüedades, proponer teorías sobre finales abiertos y analizar el subtexto técnico.
REGLAS DE DETECTIVE (OBLIGATORIAS):
- Analiza objetos específicos, gestos, sonidos o elementos técnicos (ausencia de señal en celular, comportamiento de animales, cambios de iluminación) como pistas narrativas.
- Si el final es ambiguo, toma una postura clara Y presenta la teoría opuesta con su evidencia. No seas neutro.
- Menciona elementos concretos de la ${etiquetas.obra.toLowerCase()} (nombres de personajes, escenas específicas, objetos). Nunca seas genérico.
- Si hay un símbolo recurrente (objeto o cualquier elemento que aparezca importante en la pelicula), explica exactamente qué representa y en qué momentos aparece.

JSON Schema:
{
  "narrativa": {
    "intro": "Gancho que plantea la pregunta central que la ${etiquetas.obra.toLowerCase()} nunca responde directamente (2-3 oraciones que generen intriga inmediata)",
    "secciones": [
      {
        "titulo": "El Conflicto Real",
        "texto": "Analiza el conflicto interno del protagonista como un caso a resolver. ¿Qué quiere vs qué necesita? ¿Qué le impide verlo? Conecta esto con decisiones específicas de la trama (120-150 palabras)",
        "cita": { "texto": "Frase del ${esTV ? 'creador o personaje' : 'director o personaje'} que sintetice la tensión central", "fuente": "Nombre del ${esTV ? 'creador o personaje' : 'director o personaje'}" }
      },
      {
        "titulo": "El Lenguaje de la Imagen",
        "texto": "Describe cómo la cámara, la iluminación y la composición cuentan lo que el guion calla. Menciona escenas concretas. ¿Qué plano revela la verdad? ¿Qué encuadre miente? (120-150 palabras)"
      },
      {
        "titulo": "La Tesis del Autor",
        "texto": "¿Qué afirma realmente esta ${etiquetas.obra.toLowerCase()} sobre la condición humana, la sociedad o un tema universal? Va más allá de la sinopsis — es el mensaje que el ${esTV ? 'creador' : 'director'} no dijo en voz alta (120-150 palabras)"
      }
    ]
  },
  "simbolismo": [
    {
      "icono": "fas fa-search",
      "titulo": "La pista que nadie vio",
      "texto": "Identifica un objeto, color, sonido o detalle técnico específico de la ${etiquetas.obra.toLowerCase()} que funciona como clave narrativa oculta. Explica en qué momento aparece y qué revela sobre el desenlace (70-80 palabras)"
    },
    {
      "icono": "fas fa-ghost",
      "titulo": "El peso del pasado",
      "texto": "¿Cómo se materializa el trauma o el miedo del protagonista en elementos visuales concretos? Menciona una escena específica donde esto es más evidente (70-80 palabras)"
    },
    {
      "icono": "fas fa-door-open",
      "titulo": "Los espacios hablan",
      "texto": "Analiza un espacio o locación específica de la ${etiquetas.obra.toLowerCase()} como extensión del estado mental de un personaje. ¿Qué revela la arquitectura, el desorden o la luz de ese lugar? (70-80 palabras)"
    },
    {
      "icono": "fas fa-infinity",
      "titulo": "El símbolo que lo cambia todo",
      "texto": "Identifica el elemento simbólico más importante de la obra (un animal, objeto o imagen recurrente). Explica cuántas veces aparece, en qué contextos y qué significa en el desenlace (70-80 palabras)"
    }
  ],
  "momentos": [
    {
      "tiempo": "Apertura",
      "color": "red",
      "tag": "Inicio",
      "titulo": "La primera mentira",
      "texto": "¿Qué establece la apertura que luego resultará ser falso o irónico a la luz del final? Menciona una imagen o línea de diálogo concreta (70-80 palabras)"
    },
    {
      "tiempo": "Inflexión",
      "color": "yellow",
      "tag": "Giro",
      "titulo": "El punto sin retorno",
      "texto": "La decisión o revelación que divide la obra en antes y después. ¿Por qué es imposible volver atrás desde ese momento? (70-80 palabras)"
    },
    {
      "tiempo": "Clímax",
      "color": "purple",
      "tag": "Veredicto",
      "titulo": "La escena que lo dice todo",
      "texto": "El momento donde toda la simbología converge. ¿Qué detalle visual en esta escena confirma (o contradice) la interpretación más popular? (70-80 palabras)"
    }
  ],
  "contexto": {
    "intro": "Ubicación histórica y artística de la obra.",
    "items": [
      { "icono": "fas fa-history", "titulo": "Corriente", "texto": "Relación con movimientos ${esTV ? 'televisivos o audiovisuales' : 'cinematográficos'} y obras similares que iluminan su interpretación." },
      { "icono": "fas fa-fingerprint", "titulo": "Sello de Autor", "texto": "Obsesiones recurrentes del ${esTV ? 'creador' : 'director'} que se manifiestan en esta ${etiquetas.obra.toLowerCase()} y cómo afectan la lectura del final." },
      { "icono": "fas fa-bolt", "titulo": "El debate que generó", "texto": "¿Qué teoría o controversia despertó esta ${etiquetas.obra.toLowerCase()} en el público? ¿Dividió al fandom?" }
    ]
  },
  "tecnica": {
    "intro": "Las decisiones técnicas como evidencia del significado.",
    "aspectos": [
      { "titulo": "Cromatismo", "texto": "¿Qué paleta domina y en qué escena cambia abruptamente? Ese cambio de color es una pista. Explícalo (90-100 palabras)" },
      { "titulo": "Sonido y Música", "texto": "¿Qué sonido o melodía acompaña los momentos clave? ¿Hay silencio significativo? El diseño sonoro como narrador oculto (90-100 palabras)" },
      { "titulo": "Montaje", "texto": "¿Qué dos imágenes yuxtapone el montaje de forma intencionada? ¿Hay un corte que cambia el significado de una escena? (90-100 palabras)" }
    ]
  },
"conclusion": {
  "tesis_final": "Escribe 200-300 palabras en primera persona sobre el desenlace concreto que no sea tan corto de '${pelicula.titulo}'. Toma postura sobre qué ocurrió realmente al final — quién vive, quién muere, qué significa la última imagen. Ancla tu postura en al menos un elemento visual o técnico del final (un objeto, animal, sonido o ausencia). Ejemplo del tono y nivel de especificidad que buscamos(No copies, imita): 'X no es una película sobre la supervivencia física, sino sobre la erosión de la certeza. Mi lectura es que el final es una trampa de X: la protagonista nunca escapó del sistema de creencias del captor, incluso si salió de la casa. La (objeto de la pelicula clave) no es un milagro — es el último engaño.' Escribe así de específico para '${pelicula.titulo}'.",

  "teorias_en_conflicto": "PRIMERO evalúa de forma estricta: ¿el final de '${pelicula.titulo}' es ABIERTO/AMBIGUO o CERRADO/DEFINITIVO? 

Define AMBIGUO como: múltiples interpretaciones plausibles del evento final sin confirmación explícita en la obra.
Define CERRADO como: el destino de los personajes y los hechos finales quedan claramente resueltos sin contradicción narrativa relevante.

⚠️ REGLA CRÍTICA: NO REPETIR texto con la sección de VEREDICTO, Si el final es CERRADO, está PROHIBIDO inventar teorías alternativas sobre lo que ocurrió. Solo existe una versión de los hechos.

SI es AMBIGUO:
Escribe UN SOLO párrafo de 120-150 palabras narrando exactamente dos teorías opuestas sobre el desenlace concreto. 
Nombra cada teoría con títulos poéticos basados en un elemento visual (objeto, animal, símbolo o recurso técnico).
Ambas teorías deben apoyarse en pistas reales de la ${etiquetas.obra.toLowerCase()}.

SI es CERRADO:
Escribe UN SOLO párrafo de 150-180 palabras centrado en el DEBATE REAL del final.
NO expliques versiones alternativas de los hechos.
NO sugieras que existen múltiples finales.
Enfócate exclusivamente en:
- el significado del desenlace
- la intención del ${esTV ? 'creador' : 'director'}
- las decisiones narrativas
- y qué divide al fandom (mensaje, ejecución, arco de personajes, tono, etc.)

Incluye referencias concretas a escenas, decisiones o elementos narrativos de la obra."

  "sentencia": "Una sola frase final de máximo 15 palabras. Debe sonar como el último clavo en un ataúd. Sin esperanza, puramente existencial. Estilo (No copies, imita): 'La verdadera herejía no es negar a Dios, sino creer que necesitamos su permiso para morir.'"
}
}`;
}

    // ── Prompt ENTRETENIMIENTO ────────────────────────────────────
    return `${base}
${instruccionesGenerales}

ROL: ${etiquetas.insider}. Narras datos como si fueran chismes de producción que el estudio no quería que supieras.
TONO: Conversacional, ácido y apasionado. Cada dato debe provocar una reacción: "¿en serio?", "no puede ser" o "yo no sabía eso".
OBJETIVO: Que el lector sienta que descubrió algo sobre "${pelicula.titulo}" que sus amigos cinéfilos no saben.

PRINCIPIO CENTRAL — LEE ESTO ANTES DE ESCRIBIR CUALQUIER CAMPO:
Cada texto debe tener estructura SETUP → GIRO → CONSECUENCIA.
- SETUP: contexto mínimo que hace el dato comprensible
- GIRO: el detalle sorprendente, la contradicción, el dato inesperado
- CONSECUENCIA: por qué importa, qué cambió, qué significa hoy

ANTI-PATRONES — ESTAS FRASES ESTÁN PROHIBIDAS (generan salidas aburridas):
✗ "se convirtió en un meme popular" → SIEMPRE describe el formato exacto del meme y en qué contextos se usa
✗ "el debate sobre si el final fue satisfactorio" → SIEMPRE nombra las dos posturas con argumentos concretos y cita una escena
✗ "fue un éxito en taquilla" → SIEMPRE incluye el número y una comparación que lo haga sorprendente
✗ "la actuación fue destacada" → SIEMPRE di qué escena específica, qué decisión concreta y por qué fue memorable
✗ "generó controversia en el fandom" → SIEMPRE describe la controversia: qué bando dice qué y por qué no ceden
✗ empezar una oración con "La película/serie" como primer sujeto → empieza con el dato, la cifra o la contradicción

REGLAS DE ESPECIFICIDAD (OBLIGATORIAS):
- Nombra siempre: actores reales, personajes específicos, directores, años aproximados.
- Si no tienes certeza de un dato concreto de "${pelicula.titulo}", elige un ángulo diferente del que sí tengas datos. No inventes nombres propios.
- FORMATO "CASI FUE OTRO": "[Nombre real] rechazó/perdió el rol de [Personaje] por [razón específica y reveladora]. [Actor real] lo tomó y [consecuencia concreta para la obra]."

REGLAS DE CONTEXTO (OBLIGATORIAS):
- ANIMADA: curiosidades de producción = crisis de estudio, directores despedidos, años de desarrollo. Sin "sets malditos".
- DOCUMENTAL: enfoca en los sujetos filmados y el proceso, no en actores de ficción.
- SERIE TV: "rodaje" → "producción". Improvisaciones = actores en escenas reales, no en rodaje técnico.

REGLAS DE SCORES:
- scores.valor: entero 55-97 calculado según calificación TMDB (${pelicula.calificacion}/10) y género. Los 4 valores deben diferir al menos en 4 puntos entre sí.
- fandom.nivel_culto: entero 1-5. 1=casi nadie la conoce, 3=audiencia mediana, 5=fenómeno que todos conocen aunque no la hayan visto.

JSON Schema — REEMPLAZA los textos de instrucción con el contenido real:
{
  "resumen": {
    "intro": "2-3 oraciones que arrancan con la contradicción más llamativa de '${pelicula.titulo}': algo que el espectador esperaba que fuera diferente, un número que no tiene sentido a primera vista, o una decisión creativa que a todos les pareció un error y resultó ser lo mejor. NO empieces con el título de la obra.",
    "puntos": [
      { "titulo": "Récord:", "texto": "Un número específico de '${pelicula.titulo}' con una comparación que lo haga impresionante. Estructura: [cifra exacta] + [qué significa eso en contexto]." },
      { "titulo": "Factor X:", "texto": "El elemento de '${pelicula.titulo}' que ninguna otra obra tiene. Debe ser tan específico que solo aplique a esta obra." },
      { "titulo": "Recepción:", "texto": "La reacción más sorprendente al estreno de '${pelicula.titulo}': la crítica que nadie esperaba, la audiencia que la odiaba y luego la amó, o el mercado donde fracasó aunque era un fenómeno en otro." },
      { "titulo": "Legado:", "texto": "Cómo '${pelicula.titulo}' vive en la cultura hoy: una escena, objeto o frase específica que la gente usa fuera de contexto y por qué es perfecta para eso." }
    ],
    "scores": [
      { "aspecto": "Adrenalina", "valor": 85, "icono": "fas fa-fire" },
      { "aspecto": "Ritmo",      "valor": 78, "icono": "fas fa-bolt" },
      { "aspecto": "Emoción",    "valor": 72, "icono": "fas fa-heart" },
      { "aspecto": "Originalidad", "valor": 68, "icono": "fas fa-star" }
    ]
  },
  "momentos": [
    {
      "tiempo": "Apertura", "color": "red", "tag": "Gancho",
      "titulo": "El detalle que lo predice todo",
      "texto": "Escribe como si le estuvieras contando a alguien por qué vale la pena pausar la película en la apertura de '${pelicula.titulo}'. SETUP: qué muestra la escena. GIRO: qué elemento específico (objeto, sonido, encuadre) anticipa el final. CONSECUENCIA: qué significa eso en la segunda visualización. (75-85 palabras)"
    },
    {
      "tiempo": "${esTV ? 'Episodio clave' : 'Acto 1'}", "color": "yellow", "tag": "Detrás de cámara",
      "titulo": "Lo que el guion no decía",
      "texto": "Una decisión de un actor o del director en '${pelicula.titulo}' que no estaba en el guion original. SETUP: qué decía el guion. GIRO: qué cambió [nombra a la persona]. CONSECUENCIA: por qué esa versión improvisada o modificada es mejor que la original. (75-85 palabras)"
    },
    {
      "tiempo": "${esTV ? 'Punto medio' : 'Acto 2'}", "color": "cyan", "tag": "Easter Egg mayor",
      "titulo": "Lo escondieron en plena vista",
      "texto": "El detalle visual de '${pelicula.titulo}' que el equipo sembró deliberadamente y que la mayoría no nota en la primera visualización. SETUP: la escena y lo que parece mostrar. GIRO: lo que realmente revela [objeto, número, color, símbolo]. CONSECUENCIA: qué cambia entender ese detalle. (75-85 palabras)"
    },
    {
      "tiempo": "Clímax", "color": "purple", "tag": "Producción real",
      "titulo": "${esTV ? 'La escena que casi no existe' : 'El rodaje que casi los mata'}",
      "texto": "Lo que realmente costó filmar o producir la escena más importante de '${pelicula.titulo}'. SETUP: lo que el público ve en pantalla. GIRO: lo que pasó en realidad durante la producción [nombra actores, director o circunstancia]. CONSECUENCIA: cómo ese caos o esfuerzo se nota (o no) en el resultado final. (75-85 palabras)"
    }
  ],
  "easter_eggs": [
    {
      "titulo": "El cameo que te miraba a la cara",
      "texto": "SETUP: la escena donde aparece. GIRO: quién es exactamente y por qué está ahí [si es el director, un actor anterior, una referencia]. CONSECUENCIA: qué significa ese guiño para los que lo captan. (75-85 palabras)",
      "dificultad": "facil"
    },
    {
      "titulo": "El homenaje que solo los fans ven",
      "texto": "SETUP: la obra o momento referenciado. GIRO: exactamente cómo '${pelicula.titulo}' lo replicó o invirtió [encuadre, diálogo, vestuario]. CONSECUENCIA: si es tributo, crítica o broma interna del equipo. (75-85 palabras)",
      "dificultad": "oculto"
    },
    {
      "titulo": "El código que el equipo dejó",
      "texto": "SETUP: el patrón (número, color, símbolo) que aparece varias veces en '${pelicula.titulo}'. GIRO: cuántas veces aparece y en qué escenas exactas. CONSECUENCIA: si es intencional o fue descubierto por el fandom y el equipo no lo negó. (75-85 palabras)",
      "dificultad": "experto"
    }
  ],
  "curiosidades": [
    {
      "icono": "fas fa-user-slash",
      "titulo": "Casi fue otro",
      "texto": "SETUP: el rol que estaba en disputa en '${pelicula.titulo}'. GIRO: [Nombre real] lo rechazó/perdió por [razón concreta y sorprendente]. CONSECUENCIA: cómo hubiera cambiado la obra si esa persona lo hacía. Termina con quién lo tomó y por qué fue la decisión correcta (o no)."
    },
    {
      "icono": "fas fa-tools",
      "titulo": "${esTV ? 'El truco de producción' : 'El truco que parece digital'}",
      "texto": "SETUP: lo que el espectador cree que es un efecto digital o una decisión sencilla en '${pelicula.titulo}'. GIRO: lo que realmente fue [efecto práctico, escenografía real, condición extrema, decisión de último minuto]. CONSECUENCIA: por qué hacerlo así en lugar de CGI cambió cómo se siente la escena."
    },
    {
      "icono": "fas fa-theater-masks",
      "titulo": "Caos entre bastidores",
      "texto": "SETUP: la situación que amenazó la producción de '${pelicula.titulo}' [conflicto, accidente, presión del estudio, reescritura]. GIRO: cómo llegó a ese punto y quién estuvo en el centro. CONSECUENCIA: si casi destruyó la obra o si ese caos terminó mejorándola."
    },
    {
      "icono": "fas fa-award",
      "titulo": "El número absurdo",
      "texto": "SETUP: el contexto normal en el que ese número tendría sentido. GIRO: el número real de '${pelicula.titulo}' [presupuesto, días de rodaje de una escena, audiencia, récord]. CONSECUENCIA: qué dice ese dato sobre las decisiones creativas o comerciales de la obra."
    }
  ],
  "fandom": {
    "nivel_culto": 3,
    "reacciones": [
      {
        "tipo": "teoria",
        "emoji": "🧠",
        "titulo": "La teoría que reescribe todo",
        "texto": "SETUP: lo que la obra parece decir sobre [personaje o situación]. GIRO: la teoría fan que lo contradice o amplía, citando al menos una escena o detalle visual específico de '${pelicula.titulo}' como evidencia. CONSECUENCIA: si el equipo la confirmó, la negó o el silencio dice todo. (75-85 palabras)"
      },
      {
        "tipo": "meme",
        "emoji": "😂",
        "titulo": "El meme que sobrevivió a la película",
        "texto": "SETUP: la escena o frase exacta de '${pelicula.titulo}'. GIRO: describe el formato del meme — qué imagen se usa, qué texto va encima, en qué situaciones cotidianas se aplica hoy. CONSECUENCIA: por qué esa escena o frase captura algo tan universal que sigue vivo años después. (75-85 palabras)"
      },
      {
        "tipo": "debate",
        "emoji": "⚔️",
        "titulo": "La guerra que nunca terminó",
        "texto": "SETUP: la decisión o momento de '${pelicula.titulo}' que dividió al fandom. GIRO: presenta los dos bandos con sus argumentos reales — Bando A dice [postura concreta] porque [evidencia de la obra]. Bando B responde [contrapostura] citando [escena o dato específico]. CONSECUENCIA: por qué este debate importa más allá de la película. (75-85 palabras)"
      }
    ],
    "veredicto_fandom": "Una frase contundente de máximo 15 palabras que capture LA emoción dominante del fandom hacia '${pelicula.titulo}'. Que suene como lo que dirías si te preguntaran en 5 segundos."
  }
}`;
  },

  // media_type: 'movie' | 'tv'
  async generarAnalisis(pelicula, tipo, media_type = 'movie') {
    const prompt = this.construirPrompt(pelicula, tipo, media_type);
    const inicio = Date.now();
    const temp   = tipo === 'profundo' ? 0.9 : 0.95;
    const esTV   = media_type === 'tv';

    let ultimoError;

    for (const modelo of MODELOS_FALLBACK) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: modelo,
            messages: [
              {
                role:    'system',
                content: `Eres un experto analista ${esTV ? 'audiovisual y de series' : 'cinematográfico'}. Responde EXCLUSIVAMENTE con el objeto JSON solicitado.`
              },
              { role: 'user', content: prompt }
            ],
            temperature:     temp,
            top_p:           0.9,
            max_tokens:      tipo === 'profundo' ? 3000 : 4500,
            response_format: { type: 'json_object' }
          })
        });

        const data = await response.json();

   if (!response.ok) {
  const msg = data.error?.message || 'Error desconocido';
  if (
    response.status === 429 ||
    response.status === 404 ||
    msg.includes('decommissioned') ||
    msg.includes('deprecated') ||
    msg.includes('Failed to generate JSON')  // ← agrega esta línea
  ) {
    ultimoError = new Error(`Error Groq: ${msg}`);
    if (response.status === 429) {
      const segundos = extraerSegundosEspera(msg);
      if (segundos > 0) await esperar(segundos * 1000);
    }
    continue;
  }
  throw new Error(`Error Groq: ${msg}`);
}

        const texto     = data.choices[0]?.message?.content || '';
const tiempo_ms = Date.now() - inicio;

// Groq a veces devuelve 200 pero con failed_generation en el error
if (data.error?.message?.includes('Failed to generate JSON')) {
  console.warn(`Modelo ${modelo} falló al generar JSON, probando siguiente...`);
  ultimoError = new Error(`Error Groq: ${data.error.message}`);
  continue;
}

if (!texto) {
  console.warn(`Modelo ${modelo} devolvió respuesta vacía, probando siguiente...`);
  ultimoError = new Error('Respuesta vacía del modelo');
  continue;
}

let jsonLimpio = texto
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim();

const inicioJson = jsonLimpio.indexOf('{');
const finJson    = jsonLimpio.lastIndexOf('}');
if (inicioJson !== -1 && finJson !== -1) {
  jsonLimpio = jsonLimpio.substring(inicioJson, finJson + 1);
}

let capas;
try {
  capas = JSON.parse(jsonLimpio);
} catch (e) {
  // JSON inválido → intentar con el siguiente modelo
  console.warn(`Modelo ${modelo} generó JSON inválido, probando siguiente...`);
  ultimoError = new Error(`JSON inválido: ${e.message}`);
  continue;
}

// El modelo a veces omite el key "fandom" y genera "": {...} como último entry.
// Detectamos por estructura interna y renombramos.
if (capas[''] !== undefined && !capas.fandom) {
  const huerfano = capas[''];
  if (huerfano && (huerfano.reacciones || huerfano.nivel_culto !== undefined)) {
    capas.fandom = huerfano;
  }
  delete capas[''];
}

return { capas, prompt, tiempo_ms };

      } catch (err) {
        if (
          err.message?.includes('Rate limit')      ||
          err.message?.includes('rate_limit')       ||
          err.message?.includes('decommissioned')   ||
          err.message?.includes('deprecated')
        ) {
          ultimoError = err;
          continue;
        }
        throw err;
      }
    }

    throw ultimoError || new Error('Todos los modelos de Groq están agotados por hoy. Intenta mañana.');
  }

};

module.exports = geminiService;