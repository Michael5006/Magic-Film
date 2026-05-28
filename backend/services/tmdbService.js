const env = require('../config/env');

const TMDB_BASE_URL = env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = env.TMDB_API_KEY;

// Idiomas permitidos en recomendaciones/similares (evita resultados muy obscuros)
// Se amplió para incluir cine europeo, nórdico y latinoamericano popular en streaming
const IDIOMAS_PERMITIDOS = [
  'en', 'es',                          // inglés, español
  'ja', 'ko', 'zh',                    // japonés, coreano, chino (anime, k-drama, c-drama)
  'fr', 'de', 'it', 'pt',             // Europa occidental
  'pl', 'sv', 'da', 'no', 'fi',       // Europa del este/nórdico (365 días, Borgen, etc.)
  'nl', 'tr', 'hi', 'ru', 'ar'        // holandés, turco, hindi, ruso, árabe
];

function idiomaPermitido(original_language) {
  return IDIOMAS_PERMITIDOS.includes(original_language);
}

// Verifica que el título esté en caracteres latinos (incluyendo acentos, ñ, ł, etc.)
// Si TMDB no tiene traducción al español, devuelve el título en su escritura original
// (devanagari, árabe, chino...) — esos los rechazamos para no romper la experiencia
function tituloEsLegible(titulo) {
  if (!titulo) return false;
  // U+0000–U+024F cubre Latin básico + Latin-1 (éñü) + Latin Extendido A/B (ł, ę, č...)
  return !/[^\u0000-\u024F\s]/.test(titulo);
}

const tmdbService = {

  // ── BÚSQUEDA MULTI (películas + series) ──────────────────────
  async buscarMultiMedia(titulo) {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(titulo)}&language=es-MX`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar TMDB');

    const data = await response.json();
    const resultados = (data.results || [])
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv');

    return resultados.map(r => {
      const esTV = r.media_type === 'tv';
      const tituloLocalizado = esTV ? r.name           : r.title;
      const tituloOriginal   = esTV ? r.original_name  : r.original_title;
      // Si TMDB no tiene traducción al español devuelve el título en su escritura original.
      // En ese caso caemos al original_title que siempre está en caracteres latinos.
      // Si ambos son ilegibles (caso muy raro), descartamos el resultado.
      const titulo = tituloEsLegible(tituloLocalizado) ? tituloLocalizado : tituloOriginal;
      if (!tituloEsLegible(titulo)) return null;
      return {
        tmdb_id:    r.id,
        titulo,
        titulo_original: tituloOriginal,
        anio:       esTV
                      ? (r.first_air_date  ? parseInt(r.first_air_date.split('-')[0])  : null)
                      : (r.release_date    ? parseInt(r.release_date.split('-')[0])    : null),
        poster_url: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
        calificacion: r.vote_average || null,
        original_language: r.original_language,
        media_type: r.media_type
      };
    }).filter(Boolean);
  },

  // ── DETALLES PELÍCULA ────────────────────────────────────────
  async obtenerDetalles(tmdb_id) {
    const url = `${TMDB_BASE_URL}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=es-MX&append_to_response=keywords,credits`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener detalles de TMDB');

    const data = await response.json();

    const keywords = data.keywords?.keywords?.map(k => k.name) || [];
    const director = data.credits?.crew?.find(p => p.job === 'Director')?.name || 'Desconocido';
    const reparto  = (data.credits?.cast || []).slice(0, 5).map(a => ({
      nombre:     a.name,
      personaje:  a.character,
      foto:       a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null
    }));

    return {
      tmdb_id:         data.id,
      titulo:          data.title,
      titulo_original: data.original_title,
      anio:            data.release_date ? parseInt(data.release_date.split('-')[0]) : null,
      director,
      duracion_min:    data.runtime || null,
      sinopsis:        data.overview || '',
      calificacion:    data.vote_average || null,
      poster_url:      data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
       backdrop_url:    data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null, // ← nuevo
      keywords,
      reparto,
      generos:         data.genres?.map(g => g.name) || [],
      media_type:      'movie'
    };
  },

  // ── DETALLES SERIE ───────────────────────────────────────────
  // TV usa campos distintos: name, first_air_date, number_of_seasons, etc.
  // Dejamos temporadas/episodios en el objeto para futuras mejoras por temporada.
  async obtenerDetallesSerie(tmdb_id) {
    const url = `${TMDB_BASE_URL}/tv/${tmdb_id}?api_key=${TMDB_API_KEY}&language=es-MX&append_to_response=keywords,credits`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener detalles de serie TMDB');

    const data = await response.json();

    // Keywords de TV vienen en results[], no en keywords[]
    const keywords = data.keywords?.results?.map(k => k.name) || [];

    // Creadores (equivalente al director en películas)
    const creadores = (data.created_by || []).map(c => c.name).join(', ') || 'Desconocido';

    const reparto = (data.credits?.cast || []).slice(0, 5).map(a => ({
      nombre:    a.name,
      personaje: a.character,
      foto:      a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null
    }));

    // Duración por episodio (TV devuelve un array, tomamos el primero)
    const duracion_episodio = data.episode_run_time?.[0] || null;

    return {
      tmdb_id:            data.id,
      titulo:             data.name,
      titulo_original:    data.original_name,
      anio:               data.first_air_date ? parseInt(data.first_air_date.split('-')[0]) : null,
      director:           creadores,
      duracion_min:       duracion_episodio,
      sinopsis:           data.overview || '',
      calificacion:       data.vote_average || null,
      poster_url:         data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdrop_url:       data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      keywords,
      reparto,
      generos:            data.genres?.map(g => g.name) || [],
      media_type:         'tv',
      // Datos extra de serie — guardados para futura expansión por temporadas
      temporadas:         data.number_of_seasons  || null,
      episodios:          data.number_of_episodes || null,
      estado_emision:     data.status             || null   // 'Ended', 'Returning Series', etc.
    };
  },

  // ── VIDEOS (película o serie) ────────────────────────────────
  async obtenerVideos(tmdb_id, media_type = 'movie') {
    const tipo = media_type === 'tv' ? 'tv' : 'movie';

    let url = `${TMDB_BASE_URL}/${tipo}/${tmdb_id}/videos?api_key=${TMDB_API_KEY}&language=es-MX`;
    let response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener videos de TMDB');
    let data = await response.json();

    // Retry sin filtro de idioma si no hay resultados en español
    if (!data.results || data.results.length === 0) {
      url = `${TMDB_BASE_URL}/${tipo}/${tmdb_id}/videos?api_key=${TMDB_API_KEY}`;
      response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener videos de TMDB');
      data = await response.json();
    }

    const videos = (data.results || []).filter(v => v.site === 'YouTube');

    const typeOrder = { 'Trailer': 0, 'Teaser': 1, 'Featurette': 2, 'Behind the Scenes': 3, 'Clip': 4 };
    videos.sort((a, b) => {
      if (a.official !== b.official) return a.official ? -1 : 1;
      return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
    });

    return videos;
  },

  // ── SIMILARES INTELIGENTES (película) ────────────────────────
  // Para profundo: /recommendations + /discover por keyword IDs (temas reales)
  // Para entretenimiento: /recommendations (mejor que /similar)
  // Fallback a /similar si los anteriores dan < 4 resultados
  async _similaresPelicula(tmdb_id, kwIds = [], tipo_analisis = 'entretenimiento') {
    const apiKey     = env.TMDB_API_KEY;
    const base       = env.TMDB_BASE_URL;
    const esProfundo = tipo_analisis === 'profundo';
    const vistos     = new Set([parseInt(tmdb_id)]);
    let   pool       = [];

    // 1. /recommendations — algoritmo TMDB por comportamiento de usuarios
    try {
      const res  = await fetch(`${base}/movie/${tmdb_id}/recommendations?api_key=${apiKey}&language=es-MX`);
      const data = await res.json();
      for (const p of (data.results || [])) {
        if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
          vistos.add(p.id);
          pool.push(p);
        }
      }
    } catch (_) {}

    // 2. /discover por keyword IDs — solo para películas profundas
    // Usa los IDs reales de TMDB (OR lógico) → encuentra películas con los
    // mismos temas/simbolismos, no solo el mismo género
    if (esProfundo && kwIds.length > 0) {
      try {
        const ids = kwIds.slice(0, 6).join('|');
        const url = `${base}/discover/movie?api_key=${apiKey}&language=es-MX` +
                    `&with_keywords=${ids}&sort_by=vote_average.desc` +
                    `&vote_count.gte=200&without_genres=16`; // sin animación
        const res  = await fetch(url);
        const data = await res.json();
        for (const p of (data.results || [])) {
          if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
            vistos.add(p.id);
            pool.push(p);
          }
        }
      } catch (_) {}
    }

    // 3. Fallback a /similar si el pool sigue siendo escaso
    if (pool.length < 4) {
      try {
        const res  = await fetch(`${base}/movie/${tmdb_id}/similar?api_key=${apiKey}&language=es-MX`);
        const data = await res.json();
        for (const p of (data.results || [])) {
          if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
            vistos.add(p.id);
            pool.push(p);
          }
        }
      } catch (_) {}
    }

    // Ordenar por calificación y tomar los 8 mejores
    return pool
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 8)
      .map(p => ({
        tmdb_id:      p.id,
        titulo:       p.title,
        anio:         p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
        poster_url:   `https://image.tmdb.org/t/p/w300${p.poster_path}`,
        calificacion: p.vote_average || null
      }));
  },

  // ── SIMILARES INTELIGENTES (serie) ────────────────────────────
  async _similaresSerie(tmdb_id, kwIds = [], tipo_analisis = 'entretenimiento') {
    const apiKey     = env.TMDB_API_KEY;
    const base       = env.TMDB_BASE_URL;
    const esProfundo = tipo_analisis === 'profundo';
    const vistos     = new Set([parseInt(tmdb_id)]);
    let   pool       = [];

    try {
      const res  = await fetch(`${base}/tv/${tmdb_id}/recommendations?api_key=${apiKey}&language=es-MX`);
      const data = await res.json();
      for (const p of (data.results || [])) {
        if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
          vistos.add(p.id);
          pool.push(p);
        }
      }
    } catch (_) {}

    if (esProfundo && kwIds.length > 0) {
      try {
        const ids = kwIds.slice(0, 6).join('|');
        const url = `${base}/discover/tv?api_key=${apiKey}&language=es-MX` +
                    `&with_keywords=${ids}&sort_by=vote_average.desc&vote_count.gte=100`;
        const res  = await fetch(url);
        const data = await res.json();
        for (const p of (data.results || [])) {
          if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
            vistos.add(p.id);
            pool.push(p);
          }
        }
      } catch (_) {}
    }

    if (pool.length < 4) {
      try {
        const res  = await fetch(`${base}/tv/${tmdb_id}/similar?api_key=${apiKey}&language=es-MX`);
        const data = await res.json();
        for (const p of (data.results || [])) {
          if (!vistos.has(p.id) && idiomaPermitido(p.original_language) && p.poster_path) {
            vistos.add(p.id);
            pool.push(p);
          }
        }
      } catch (_) {}
    }

    return pool
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 8)
      .map(p => ({
        tmdb_id:      p.id,
        titulo:       p.name,
        anio:         p.first_air_date ? parseInt(p.first_air_date.split('-')[0]) : null,
        poster_url:   `https://image.tmdb.org/t/p/w300${p.poster_path}`,
        calificacion: p.vote_average || null,
        media_type:   'tv'
      }));
  },

  // ── DATOS COMPLETOS PELÍCULA (para prompt de IA) ─────────────
  async obtenerDatosCompletos(tmdb_id, tipo_analisis = 'entretenimiento') {
    try {
      const apiKey = env.TMDB_API_KEY;
      const base   = env.TMDB_BASE_URL;

      const [detalles, creditos, keywords] = await Promise.all([
        fetch(`${base}/movie/${tmdb_id}?api_key=${apiKey}&language=es-MX`).then(r => r.json()),
        fetch(`${base}/movie/${tmdb_id}/credits?api_key=${apiKey}&language=es-MX`).then(r => r.json()),
        fetch(`${base}/movie/${tmdb_id}/keywords?api_key=${apiKey}`).then(r => r.json())
      ]);

      const reparto     = (creditos.cast || []).slice(0, 5).map(a => ({
        nombre:    a.name,
        personaje: a.character,
        foto:      a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null
      }));
      const repartoTexto = reparto.map(a => `${a.nombre} como ${a.personaje}`).join(', ');

      const crew       = creditos.crew || [];
      const dp         = crew.find(c => c.job === 'Director of Photography')?.name || null;
      const compositor = crew.find(c => c.job === 'Original Music Composer')?.name || null;
      const guionista  = crew.find(c => c.department === 'Writing')?.name || null;

      const kwObjs = keywords.keywords || [];
      const kw     = kwObjs.map(k => k.name).join(', ');
      const kwIds  = kwObjs.map(k => k.id);   // IDs para /discover

      // Similares inteligentes — usa tipo_analisis para decidir la estrategia
      const similares      = await this._similaresPelicula(tmdb_id, kwIds, tipo_analisis);
      const similaresTexto = similares.map(p => p.titulo).join(', ');

      const presupuesto = detalles.budget  ? `$${(detalles.budget  / 1000000).toFixed(1)}M` : null;
      const recaudacion = detalles.revenue ? `$${(detalles.revenue / 1000000).toFixed(1)}M` : null;

      return {
        reparto, repartoTexto, dp, compositor, guionista,
        keywords: kw, similares, similaresTexto, presupuesto, recaudacion,
        duracion:    detalles.runtime ? `${detalles.runtime} min` : null,
        paises:      (detalles.production_countries || []).map(p => p.name).join(', '),
        productoras: (detalles.production_companies || []).slice(0, 3).map(p => p.name).join(', ')
      };
    } catch (err) {
      return {};
    }
  },

  // ── DATOS COMPLETOS SERIE (para prompt de IA) ────────────────
  async obtenerDatosCompletosSerie(tmdb_id, tipo_analisis = 'entretenimiento') {
    try {
      const apiKey = env.TMDB_API_KEY;
      const base   = env.TMDB_BASE_URL;

      const [detalles, creditos, keywords] = await Promise.all([
        fetch(`${base}/tv/${tmdb_id}?api_key=${apiKey}&language=es-MX`).then(r => r.json()),
        fetch(`${base}/tv/${tmdb_id}/credits?api_key=${apiKey}&language=es-MX`).then(r => r.json()),
        fetch(`${base}/tv/${tmdb_id}/keywords?api_key=${apiKey}`).then(r => r.json())
      ]);

      const reparto      = (creditos.cast || []).slice(0, 5).map(a => ({
        nombre:    a.name,
        personaje: a.character,
        foto:      a.profile_path ? `https://image.tmdb.org/t/p/w185${a.profile_path}` : null
      }));
      const repartoTexto = reparto.map(a => `${a.nombre} como ${a.personaje}`).join(', ');

      const crew       = creditos.crew || [];
      const compositor = crew.find(c => c.job === 'Original Music Composer')?.name || null;
      const guionista  = crew.find(c => c.department === 'Writing')?.name || null;

      // Keywords de TV en results[] — guardamos también los IDs para /discover
      const kwObjs = keywords.results || [];
      const kw     = kwObjs.map(k => k.name).join(', ');
      const kwIds  = kwObjs.map(k => k.id);

      // Similares inteligentes
      const similares      = await this._similaresSerie(tmdb_id, kwIds, tipo_analisis);
      const similaresTexto = similares.map(p => p.titulo).join(', ');

      return {
        reparto, repartoTexto, compositor, guionista,
        keywords: kw, similares, similaresTexto,
        temporadas:  detalles.number_of_seasons  || null,
        episodios:   detalles.number_of_episodes || null,
        duracion:    detalles.episode_run_time?.[0] ? `${detalles.episode_run_time[0]} min/ep` : null,
        paises:      (detalles.origin_country || []).join(', '),
        productoras: (detalles.production_companies || []).slice(0, 3).map(p => p.name).join(', ')
      };
    } catch (err) {
      return {};
    }
  }

};

module.exports = tmdbService;