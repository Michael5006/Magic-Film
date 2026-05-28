const Pelicula = require('../models/Pelicula');
const tmdbService = require('../services/tmdbService');
const clasificadorService = require('../services/clasificadorService');
const { pool } = require('../config/db');
const env = require('../config/env');
const { success, error } = require('../utils/responseHelper');

// Se mantiene SOLO para endpoints movie-only (populares, porGenero, postersFondo)
// En buscar() ya no se usa — buscarMultiMedia() filtra por original_language
function esTituloLatino(titulo) {
    if (!titulo) return false;
    const noLatino = /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    return !noLatino.test(titulo);
}

// Caché para el endpoint /populares — se invalida cada 30 min
let popularesCache = { data: null, ts: 0 };

const peliculasController = {

    // GET /api/peliculas/buscar?q=titulo
    async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return error(res, 'El término de búsqueda debe tener al menos 2 caracteres', 400);
            }

            if (req.usuario) {
                try {
                    const [peliculaEnBD] = await pool.execute(
                        'SELECT id FROM peliculas WHERE titulo LIKE ? LIMIT 1',
                        [`%${q}%`]
                    );
                    const pelicula_id = peliculaEnBD[0]?.id || null;
                    await pool.execute(
                        'INSERT INTO historial_busquedas (usuario_id, termino_buscado, pelicula_id) VALUES (?, ?, ?)',
                        [req.usuario.id, q, pelicula_id]
                    );
                } catch (e) {}
            }

            const enBD = await Pelicula.buscarPorTitulo(q);
            if (enBD.length > 0) {
                return success(res, { peliculas: enBD, fuente: 'base_de_datos' });
            }

            // buscarMultiMedia() ya devuelve objetos normalizados con media_type
            // y filtra por original_language — no necesita map() ni esTituloLatino()
            const resultados = await tmdbService.buscarMultiMedia(q);
            if (resultados.length === 0) {
                return success(res, { peliculas: [], fuente: 'tmdb' });
            }

            return success(res, { peliculas: resultados.slice(0, 20), fuente: 'tmdb' });

        } catch (err) {
            return error(res, 'Error al buscar', 500);
        }
    },

    // GET /api/peliculas/:tmdb_id?media_type=movie|tv
    async obtener(req, res) {
        try {
            const { tmdb_id } = req.params;
            const media_type = req.query.media_type === 'tv' ? 'tv' : 'movie';

            let pelicula = await Pelicula.buscarPorTmdbId(tmdb_id);

            if (!pelicula) {
                // Bifurcar: serie o película
                const datos = media_type === 'tv'
                    ? await tmdbService.obtenerDetallesSerie(tmdb_id)
                    : await tmdbService.obtenerDetalles(tmdb_id);

                const tipo_analisis = await clasificadorService.clasificar(
                    datos.keywords,
                    datos.generos,
                    datos.sinopsis,
                    datos.calificacion,
                    datos.duracion_min,
                    datos.titulo
                );

                // media_type se guarda en BD — requiere Cambio 4 (schema.sql)
                const id = await Pelicula.crear({ ...datos, tipo_analisis, media_type });
                pelicula = await Pelicula.buscarPorId(id);
            }

            return success(res, { pelicula });

        } catch (err) {
            return error(res, 'Error al obtener', 500);
        }
    },

    // GET /api/peliculas/populares — solo películas, esTituloLatino se mantiene
    async populares(req, res) {
        // Caché en memoria: evita recalcular clasificación IA en cada visita al index
        const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
        const ahora = Date.now();
        if (popularesCache.data && (ahora - popularesCache.ts) < CACHE_TTL) {
            return success(res, { peliculas: popularesCache.data });
        }

        try {
            const url = `${env.TMDB_BASE_URL}/movie/popular?api_key=${env.TMDB_API_KEY}&language=es-MX&page=1`;
            const response = await fetch(url);
            const data = await response.json();

            const peliculas = await Promise.all(
                data.results
                    .slice(0, 20)
                    .filter(p => esTituloLatino(p.title))
                    .slice(0, 12)
                    .map(async (p) => {
                        // Usar tipo_analisis de BD si ya existe — evita inconsistencia con la página de análisis
                        const enBD = await Pelicula.buscarPorTmdbId(String(p.id));
                        let tipo = enBD?.tipo_analisis;
                        if (!tipo) {
                            const detUrl = `${env.TMDB_BASE_URL}/movie/${p.id}/keywords?api_key=${env.TMDB_API_KEY}`;
                            const detRes = await fetch(detUrl);
                            const detData = await detRes.json();
                            const keywords = detData.keywords?.map(k => k.name) || [];
                            tipo = await clasificadorService.clasificar(keywords, [], '', p.vote_average || 0, 0, p.title);
                        }
                        return {
                            tmdb_id:       p.id,
                            titulo:        p.title,
                            anio:          p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
                            poster_url:    p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
                            calificacion:  p.vote_average || null,
                            tipo_analisis: tipo,
                            media_type:    'movie'
                        };
                    })
            );

            popularesCache = { data: peliculas, ts: Date.now() };
            return success(res, { peliculas });

        } catch (err) {
            return error(res, 'Error al obtener películas populares', 500);
        }
    },

    // GET /api/peliculas/recientes — últimas películas/series con análisis completo
    async recientes(req, res) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.tmdb_id, p.titulo, p.anio, p.poster_url, p.tipo_analisis,
                        p.calificacion, p.media_type, a.actualizado_en
                 FROM peliculas p
                 JOIN analisis a ON a.pelicula_id = p.id
                 WHERE a.estado = 'completo'
                 ORDER BY a.actualizado_en DESC
                 LIMIT 12`
            );
            return success(res, { peliculas: rows });
        } catch (err) {
            return error(res, 'Error al obtener recientes', 500);
        }
    },

    // GET /api/peliculas/genero/:genero_id — soporta IDs simples y combinados (18,53)
    async porGenero(req, res) {
        try {
            const { genero_id } = req.params;

            // ── K-Drama: búsqueda especial por idioma coreano en TV ──
            if (String(genero_id) === '99') {
                const construirUrlKDrama = (pagina) =>
                    `${env.TMDB_BASE_URL}/discover/tv?api_key=${env.TMDB_API_KEY}` +
                    `&language=es-MX&with_genres=18` +
                    `&with_original_language=ko` +
                    `&sort_by=popularity.desc` +
                    `&vote_count.gte=50` +
                    `&page=${pagina}`;

                const pag = Math.floor(Math.random() * 3) + 1;
                let response = await fetch(construirUrlKDrama(pag));
                let data = await response.json();
                if (!data.results || data.results.length < 5) {
                    response = await fetch(construirUrlKDrama(1));
                    data = await response.json();
                }

                const peliculas = (data.results || [])
                    .filter(p => p.poster_path)
                    .slice(0, 20)
                    .map(p => ({
                        tmdb_id:      p.id,
                        titulo:       p.name || p.original_name,
                        anio:         p.first_air_date ? parseInt(p.first_air_date.split('-')[0]) : null,
                        poster_url:   `https://image.tmdb.org/t/p/w500${p.poster_path}`,
                        calificacion: p.vote_average || null,
                        media_type:   'tv',
                        original_language: 'ko'
                    }));

                return success(res, { peliculas });
            }

            // ── Exclusiones por género ────────────────────────────────
            const SIN_GENEROS = {
                '53':   '28',      // Thriller   → sin Acción
                '9648': '28,35',   // Misterio   → sin Acción ni Comedia
                '80':   '28',      // Crimen     → sin Acción pura
            };

            const primerGenero = String(genero_id).split(',')[0].split('|')[0].trim();
            const sinGeneros   = SIN_GENEROS[primerGenero] || '';

            const construirUrl = (pagina) => {
                let u = `${env.TMDB_BASE_URL}/discover/movie?api_key=${env.TMDB_API_KEY}` +
                        `&language=es-MX&with_genres=${genero_id}` +
                        `&sort_by=vote_average.desc` +
                        `&vote_count.gte=400` +
                        `&vote_average.gte=6.5` +
                        `&page=${pagina}`;
                if (sinGeneros) u += `&without_genres=${sinGeneros}`;
                return u;
            };

            const paginaAleatoria = Math.floor(Math.random() * 4) + 1;
            let response = await fetch(construirUrl(paginaAleatoria));
            let data     = await response.json();

            if (!data.results || data.results.length < 5) {
                response = await fetch(construirUrl(1));
                data     = await response.json();
            }

            const peliculas = (data.results || [])
                .filter(p => esTituloLatino(p.title) && p.poster_path)
                .slice(0, 20)
                .map(p => ({
                    tmdb_id:      p.id,
                    titulo:       p.title,
                    anio:         p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
                    poster_url:   `https://image.tmdb.org/t/p/w500${p.poster_path}`,
                    calificacion: p.vote_average || null,
                    media_type:   'movie'
                }));

            return success(res, { peliculas });

        } catch (err) {
            return error(res, 'Error al obtener películas por género', 500);
        }
    },

    // GET /api/peliculas/posters-fondo — solo películas, esTituloLatino se mantiene
    async postersFondo(req, res) {
        try {
            const endpoints = [
                `movie/popular?language=es-MX`,
                `movie/top_rated?language=es-MX`,
                `movie/now_playing?language=es-MX`,
                `trending/movie/week?language=es-MX`,
            ];

            const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
            const pagina   = Math.floor(Math.random() * 5) + 1;

            const url = `${env.TMDB_BASE_URL}/${endpoint}&api_key=${env.TMDB_API_KEY}&page=${pagina}`;
            const response = await fetch(url);
            const data = await response.json();

            const posters = (data.results || [])
                .filter(p => p.poster_path && esTituloLatino(p.title))
                .map(p => `https://image.tmdb.org/t/p/w500${p.poster_path}`)
                .sort(() => Math.random() - 0.5)
                .slice(0, 24);

            return success(res, { posters });

        } catch (err) {
            return error(res, 'Error al obtener posters', 500);
        }
    },

    // GET /api/peliculas/:tmdb_id/youtube?tipo=profundo&media_type=movie|tv
    async youtube(req, res) {
        try {
            const { tmdb_id } = req.params;
            const { tipo, titulo } = req.query;
            const media_type = req.query.media_type === 'tv' ? 'tv' : 'movie';
            const TTL_MS = 30 * 24 * 60 * 60 * 1000;

            const cache = await Pelicula.obtenerYoutubeVideos(tmdb_id);
            if (cache && cache.videos[tipo]?.length > 0) {
                const edad = Date.now() - new Date(cache.updated_at).getTime();
                if (edad < TTL_MS) return success(res, { videos: cache.videos[tipo] });
            }

            const pelicula       = await Pelicula.buscarPorTmdbId(tmdb_id);
            const tituloOriginal = pelicula?.titulo_original || titulo || '';
            const tituloES       = pelicula?.titulo          || titulo || '';
            const anio           = pelicula?.anio            || '';
            const director       = pelicula?.director        || '';
            const reparto        = Array.isArray(pelicula?.reparto) ? pelicula.reparto : [];
            const actor          = reparto[0]?.nombre || '';
            const ancla          = actor || director || '';

            // ── Detección de título genérico ─────────────────────────
            // Solo genérico si AMBOS títulos son de 1 palabra ("Drama"/"Drama")
            // "El Drama" tiene 2 palabras → NO genérico (evita filtrar de más)
            const palabrasSignificativas = [...new Set(
                `${tituloES} ${tituloOriginal}`.toLowerCase().split(/\s+/).filter(p => p.length > 3)
            )];
            const totalPalabrasES   = (tituloES   || '').trim().split(/\s+/).filter(Boolean).length;
            const totalPalabrasOrig = (tituloOriginal || '').trim().split(/\s+/).filter(Boolean).length;
            const esGenerico = totalPalabrasES <= 1 && totalPalabrasOrig <= 1 && palabrasSignificativas.length <= 1;

            // ── Helpers ──────────────────────────────────────────────
            function esShort(duration, title, description) {
                const m      = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                const segs   = (parseInt(m?.[1]||0)*3600) + (parseInt(m?.[2]||0)*60) + parseInt(m?.[3]||0);
                if (segs < 180) return true;
                return (title + ' ' + description).toLowerCase().includes('#short');
            }

            // Relevancia: el título del video debe contener el título de la película.
            // Para títulos genéricos (1 sola palabra): además exige año O actor en el título.
            function esRelevante(v, tES, tOrig, anioP, actorP) {
                const vt         = v.snippet.title.toLowerCase();
                const tEsLow     = (tES   || '').toLowerCase();
                const tOrigLow   = (tOrig || '').toLowerCase();
                const anioStr    = String(anioP || '');
                const actorFirst = (actorP || '').toLowerCase().split(' ')[0];

                const tieneES   = tEsLow   && vt.includes(tEsLow);
                const tieneOrig = tOrigLow && vt.includes(tOrigLow);

                if (!tieneES && !tieneOrig) {
                    const pES   = tEsLow.split(/\s+/).filter(p => p.length > 3);
                    const pOrig = tOrigLow.split(/\s+/).filter(p => p.length > 3);
                    const mES   = pES.length   >= 2 && pES.every(p   => vt.includes(p));
                    const mOrig = pOrig.length >= 2 && pOrig.every(p => vt.includes(p));
                    if (!mES && !mOrig) return false;
                }

                if (esGenerico) {
                    const tieneAnio  = anioStr    && vt.includes(anioStr);
                    const tieneActor = actorFirst && vt.includes(actorFirst);
                    if (!tieneAnio && !tieneActor) return false;
                }
                return true;
            }

            // ── Ejecutor de búsqueda YouTube ─────────────────────────
            const allVideos = [];
            const seenIds   = new Set();

            async function buscar(queries, regionCode, filtroIdioma, soloConSubtitulos = false) {
                for (const query of queries) {
                    if (allVideos.length >= 4) break;
                    try {
                        let ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet` +
                                    `&q=${encodeURIComponent(query)}&type=video&maxResults=10` +
                                    `&relevanceLanguage=es&regionCode=${regionCode}` +
                                    `&videoEmbeddable=true&key=${env.YOUTUBE_API_KEY}`;
                        if (soloConSubtitulos) ytUrl += '&videoCaption=closedCaption';

                        const res  = await fetch(ytUrl);
                        const data = await res.json();
                        if (!data.items?.length) continue;

                        const ids     = data.items.map(v => v.id.videoId).join(',');
                        const detRes  = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${env.YOUTUBE_API_KEY}`);
                        const detData = await detRes.json();

                        for (const v of detData.items || []) {
                            if (allVideos.length >= 4) break;
                            if (seenIds.has(v.id)) continue;
                            if (esShort(v.contentDetails.duration, v.snippet.title, v.snippet.description)) continue;
                            if (!esRelevante(v, tituloES, tituloOriginal, anio, actor)) continue;

                            const lang = (v.snippet.defaultAudioLanguage || v.snippet.defaultLanguage || '').toLowerCase();

                            if (filtroIdioma === 'es') {
                                // Español: aceptar si el idioma empieza por 'es' O no tiene metadata
                                if (lang && !lang.startsWith('es')) continue;
                            } else if (filtroIdioma === 'en') {
                                // Inglés con subtítulos: exigir idioma en
                                if (lang && !lang.startsWith('en')) continue;
                            }
                            // filtroIdioma === 'any' → sin restricción

                            seenIds.add(v.id);
                            allVideos.push({
                                id:        v.id,
                                titulo:    v.snippet.title,
                                canal:     v.snippet.channelTitle,
                                thumbnail: v.snippet.thumbnails.medium.url
                            });
                        }
                    } catch (_) {}
                }
            }

            // ── Queries por tipo de análisis ─────────────────────────
            // Usamos tituloOriginal + tituloES + ancla (actor/director)
            // Variedad de términos: análisis, reseña, crítica, opinión
            // → mayor cobertura para películas nuevas con poco contenido
            const terminosES = tipo === 'profundo'
                ? ['análisis explicación', 'análisis completo', 'reseña análisis', 'crítica', 'explicado']
                : ['curiosidades datos',   'curiosidades',      'reseña',          'behind the scenes español', 'trivia'];

            function construirQueries(terminos) {
                const qs = new Set();
                for (const t of terminos) {
                    qs.add(`"${tituloES}"       ${anio} ${t}`);
                    qs.add(`"${tituloOriginal}" ${anio} ${t}`);
                    if (ancla) {
                        qs.add(`"${tituloOriginal}" ${ancla} ${t}`);
                        qs.add(`"${tituloES}"       ${ancla} ${t}`);
                    }
                    if (qs.size >= 6) break;
                }
                return [...qs].slice(0, 6);
            }

            const queriesES = construirQueries(terminosES);

            // ── FASE 1: Español Latino (MX) ───────────────────────────
            await buscar(queriesES, 'MX', 'es');

            // ── FASE 2: Español España (ES) ───────────────────────────
            if (allVideos.length < 3) {
                await buscar(queriesES, 'ES', 'es');
            }

            // ── FASE 3: Inglés con subtítulos (CC) ───────────────────
            // Solo si no se encontraron suficientes videos en español.
            // videoCaption=closedCaption garantiza que el video tiene subtítulos.
            if (allVideos.length < 2) {
                const terminosEN = tipo === 'profundo'
                    ? ['analysis explained', 'full analysis', 'breakdown explained', 'explained']
                    : ['trivia facts',       'behind the scenes', 'easter eggs',     'everything you missed'];

                const queriesEN = construirQueries(terminosEN);
                await buscar(queriesEN, 'US', 'en', true); // soloConSubtitulos=true
            }

            const videos = allVideos.slice(0, 4);
            if (videos.length > 0) await Pelicula.actualizarYoutubeVideos(tmdb_id, tipo, videos);
            return success(res, { videos });

        } catch (err) {
            return error(res, 'Error buscando YouTube', 500);
        }
    },

async trailer(req, res) {
    try {
        const { tmdb_id } = req.params;
        const media_type  = req.query.media_type === 'tv' ? 'tv' : 'movie';
        const apiKey      = env.TMDB_API_KEY;
        const base        = env.TMDB_BASE_URL;
        const tipo        = `${media_type}/${tmdb_id}/videos?api_key=${apiKey}`;

        const PAISES_LATINO = new Set([
            'MX','AR','CO','CL','PE','VE','EC','BO','PY',
            'UY','CR','GT','HN','SV','NI','PA','DO','CU','PR'
        ]);

        // ── 1. Intentar con TMDB ──────────────────────────────────
        const [resLatino, resEspana, resTodos] = await Promise.all([
            fetch(`${base}/${tipo}&language=es-419`),
            fetch(`${base}/${tipo}&language=es-MX`),
            fetch(`${base}/${tipo}`)
        ]);

        const [dataLatino, dataEspana, dataTodos] = await Promise.all([
            resLatino.json(), resEspana.json(), resTodos.json()
        ]);

        const vistos = new Set();
        const videos = [];
        for (const v of [
            ...(dataLatino.results || []),
            ...(dataEspana.results || []),
            ...(dataTodos.results  || [])
        ]) {
            if (v.site === 'YouTube' && !vistos.has(v.key)) {
                vistos.add(v.key);
                videos.push(v);
            }
        }

        const esTrailer = v => v.type === 'Trailer';
        const esES      = v => v.iso_639_1 === 'es';
        const esLatino  = v => esES(v) && PAISES_LATINO.has(v.iso_3166_1);
        const esEspana  = v => esES(v) && v.iso_3166_1 === 'ES';
        // ── TMDB: Latino primero; España guardado como último recurso ──
        let trailer =
            videos.find(v => esTrailer(v) && v.official && esLatino(v)) ||
            videos.find(v => esTrailer(v) && esLatino(v))               ||
            null;

        // Fallbacks de TMDB guardados para cuando YouTube no encuentre nada
        const trailerEspanaFallback =
            videos.find(v => esTrailer(v) && v.official && esEspana(v)) ||
            videos.find(v => esTrailer(v) && esEspana(v))               ||
            videos.find(v => esTrailer(v) && esES(v))                   ||
            videos.find(v => v.type === 'Teaser' && esES(v))            ||
            null;

        // Último recurso: cualquier trailer oficial en TMDB (aunque sea en inglés)
        const trailerCualquierFallback =
            videos.find(v => esTrailer(v) && v.official) ||
            videos.find(v => esTrailer(v))               ||
            null;

        // ── 2. Fallback YouTube — Latino → Inglés CC → España ────────
        if (!trailer && env.YOUTUBE_API_KEY) {

            // Obtener títulos en ambos idiomas
            const [detResES, detResEN] = await Promise.all([
                fetch(`${base}/${media_type}/${tmdb_id}?api_key=${apiKey}&language=es-MX`),
                fetch(`${base}/${media_type}/${tmdb_id}?api_key=${apiKey}&language=en-US`)
            ]);
            const [detDataES, detDataEN] = await Promise.all([
                detResES.json(), detResEN.json()
            ]);

            const tituloES   = (detDataES.title || detDataES.name || '').toLowerCase();
            const tituloOrig = (detDataES.original_title || detDataES.original_name || '').toLowerCase();
            const tituloEN   = (detDataEN.title || detDataEN.name || '').toLowerCase();
            const titulos    = [...new Set([tituloES, tituloEN, tituloOrig].filter(Boolean))];

            function esRelevante(videoTitulo) {
                const vt = videoTitulo.toLowerCase();
                for (const titulo of titulos) {
                    if (!titulo || titulo.length < 2) continue;
                    if (vt.includes(titulo)) return true;
                    const palabras = titulo.split(/\s+/).filter(p => p.length > 3);
                    if (palabras.length >= 2 && palabras.every(p => vt.includes(p))) return true;
                }
                return false;
            }

            const nombreBusqueda = detDataEN.title || detDataEN.name
                                || detDataES.title || detDataES.name || '';

            // Para títulos muy cortos las comillas en YouTube no devuelven resultados
            const q = (t) => t.length <= 4 ? t : `"${t}"`;

            // Ejecutor de búsqueda de trailer en YouTube
            async function buscarTrailerYT(queries, regionCode, filtroIdioma, soloCC = false) {
                for (const query of queries) {
                    if (trailer) break;
                    try {
                        let ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet` +
                                    `&q=${encodeURIComponent(query)}&type=video&maxResults=8` +
                                    `&videoEmbeddable=true&relevanceLanguage=es&regionCode=${regionCode}` +
                                    `&key=${env.YOUTUBE_API_KEY}`;
                        if (soloCC) ytUrl += '&videoCaption=closedCaption';

                        const ytRes  = await fetch(ytUrl);
                        const ytData = await ytRes.json();
                        if (!ytData.items?.length) continue;

                        const ids       = ytData.items.map(v => v.id.videoId).join(',');
                        const detResYT  = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${env.YOUTUBE_API_KEY}`);
                        const detDataYT = await detResYT.json();

                        for (const v of detDataYT.items || []) {
                            const m    = v.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                            const segs = (parseInt(m?.[1]||0)*3600) + (parseInt(m?.[2]||0)*60) + parseInt(m?.[3]||0);
                            const lang = (v.snippet.defaultAudioLanguage || v.snippet.defaultLanguage || '').toLowerCase();
                            if (segs < 60) continue;
                            if (!esRelevante(v.snippet.title)) continue;
                            if (filtroIdioma === 'es-MX' && lang && (!lang.startsWith('es') || lang === 'es-es')) continue;
                            if (filtroIdioma === 'es'    && lang && !lang.startsWith('es')) continue;
                            if (filtroIdioma === 'en'    && lang && !lang.startsWith('en')) continue;
                            trailer = {
                                key:        v.id,
                                name:       v.snippet.title,
                                type:       'Trailer',
                                iso_639_1:  lang.split('-')[0] || filtroIdioma,
                                iso_3166_1: regionCode === 'MX' ? 'MX' : regionCode === 'ES' ? 'ES' : null,
                                fuenteYT:   true
                            };
                            break;
                        }
                    } catch (_) {}
                }
            }

            // ── Fase A: Español Latino (MX) — rechaza es-MX explícitamente ──
            const queriesEsMX = [
                `${q(nombreBusqueda)} trailer oficial español latino`,
                `${q(nombreBusqueda)} trailer subtitulado español latino`,
                `${q(tituloES)} trailer oficial`,
            ];
            await buscarTrailerYT(queriesEsMX, 'MX', 'es-MX');

            // ── Fase B: Inglés con subtítulos al español (CC) ─────────
            if (!trailer) {
                const queriesEN = [
                    `${q(nombreBusqueda)} official trailer`,
                    `${q(nombreBusqueda)} trailer`,
                ];
                await buscarTrailerYT(queriesEN, 'US', 'en', true);
            }

            // ── Fase C: Español España en YouTube ─────────────────────
            if (!trailer) {
                const queriesEsES = [
                    `${q(nombreBusqueda)} trailer español`,
                    `${q(tituloES)} trailer`,
                ];
                await buscarTrailerYT(queriesEsES, 'ES', 'es');
            }
        }

        // ── Último recurso: España TMDB → cualquier trailer TMDB ────
        if (!trailer) trailer = trailerEspanaFallback;
        if (!trailer) trailer = trailerCualquierFallback;

        if (!trailer) return success(res, { trailer: null });

        let idiomaLabel = 'Inglés';
        if (trailer.iso_3166_1 && PAISES_LATINO.has(trailer.iso_3166_1)) idiomaLabel = 'Español Latino';
        else if (trailer.iso_3166_1 === 'ES' || trailer.iso_639_1 === 'es') idiomaLabel = 'Español';

        return success(res, {
            trailer: {
                youtube_key: trailer.key,
                titulo:      trailer.name,
                tipo:        trailer.type,
                idioma:      idiomaLabel
            }
        });

    } catch (err) {
        return error(res, 'Error al obtener trailer', 500);
    }
}
};

module.exports = peliculasController;