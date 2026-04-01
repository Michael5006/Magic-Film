const Pelicula = require('../models/Pelicula');
const tmdbService = require('../services/tmdbService');
const clasificadorService = require('../services/clasificadorService');
const { pool } = require('../config/db');
const env = require('../config/env');
const { success, error } = require('../utils/responseHelper');

const peliculasController = {
    

  // GET /api/peliculas/buscar?q=titulo
  async buscar(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return error(res, 'El término de búsqueda debe tener al menos 2 caracteres', 400);
      }

 // Guardar en historial si hay usuario autenticado
if (req.usuario) {
  try {
    const [peliculaEnBD] = await pool.execute(
      'SELECT id FROM peliculas WHERE titulo LIKE ? LIMIT 1',
      [`%${q}%`]
    );
    const pelicula_id = peliculaEnBD[0]?.id || null;

    await pool.execute(
      `INSERT INTO historial_busquedas (usuario_id, termino_buscado, pelicula_id) VALUES (?, ?, ?)`,
      [req.usuario.id, q, pelicula_id]
    );
  } catch (e) { /* silencioso */ }
}

      // Primero buscar en nuestra BD
      const enBD = await Pelicula.buscarPorTitulo(q);
      if (enBD.length > 0) {
        return success(res, { peliculas: enBD, fuente: 'base_de_datos' });
      }

      // Si no está en BD, buscar en TMDB
      const resultadosTMDB = await tmdbService.buscarPelicula(q);
      
      if (resultadosTMDB.length === 0) {
        return success(res, { peliculas: [], fuente: 'tmdb' });
      }

      // Devolver los primeros 5 resultados de TMDB
      const peliculas = resultadosTMDB.slice(0, 20).map(p => ({
        tmdb_id: p.id,
        titulo: p.title,
        anio: p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
        poster_url: p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
        calificacion: p.vote_average || null
      }));

      return success(res, { peliculas, fuente: 'tmdb' });

    } catch (err) {
      console.error('Error en buscar:', err.message);
      return error(res, 'Error al buscar películas', 500);
    }
  },

  // GET /api/peliculas/:tmdb_id
  async obtener(req, res) {
    try {
      const { tmdb_id } = req.params;

      // Buscar en BD primero
      let pelicula = await Pelicula.buscarPorTmdbId(tmdb_id);

      if (!pelicula) {
        // Obtener de TMDB y guardar en BD
        const datos = await tmdbService.obtenerDetalles(tmdb_id);
        const tipo_analisis = clasificadorService.clasificar(
          datos.keywords,
          datos.generos
        );

        const id = await Pelicula.crear({ ...datos, tipo_analisis });
        pelicula = await Pelicula.buscarPorId(id);
      }

      return success(res, { pelicula });

    } catch (err) {
      console.error('Error en obtener:', err.message);
      return error(res, 'Error al obtener película', 500);
    }
  },

// GET /api/peliculas/populares
async populares(req, res) {
  try {
    const url = `${env.TMDB_BASE_URL}/movie/popular?api_key=${env.TMDB_API_KEY}&language=es-ES&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    const peliculas = await Promise.all(
      data.results.slice(0, 8).map(async (p) => {
        // Obtener keywords para clasificar
        const detUrl = `${env.TMDB_BASE_URL}/movie/${p.id}/keywords?api_key=${env.TMDB_API_KEY}`;
        const detRes = await fetch(detUrl);
        const detData = await detRes.json();
        const keywords = detData.keywords?.map(k => k.name) || [];

        const tipo = clasificadorService.clasificar(keywords, []);

        return {
          tmdb_id: p.id,
          titulo: p.title,
          anio: p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
          poster_url: p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
          calificacion: p.vote_average || null,
          tipo_analisis: tipo
        };
      })
    );

    return success(res, { peliculas });
  } catch (err) {
    console.error('Error obteniendo populares:', err.message);
    return error(res, 'Error al obtener películas populares', 500);
  }
},

// GET /api/peliculas/genero/:genero_id
async porGenero(req, res) {
  try {
    const { genero_id } = req.params;
    const url = `${env.TMDB_BASE_URL}/discover/movie?api_key=${env.TMDB_API_KEY}&language=es-ES&with_genres=${genero_id}&sort_by=popularity.desc&page=1`;
    
    const response = await fetch(url);
    const data = await response.json();

    const peliculas = data.results.slice(0, 20).map(p => ({
      tmdb_id: p.id,
      titulo: p.title,
      anio: p.release_date ? parseInt(p.release_date.split('-')[0]) : null,
      poster_url: p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
      calificacion: p.vote_average || null
    }));

    return success(res, { peliculas });
  } catch (err) {
    console.error('Error obteniendo por género:', err.message);
    return error(res, 'Error al obtener películas por género', 500);
  }
},

async youtube(req, res) {
  try {
    const { tmdb_id } = req.params;
    const { tipo, titulo } = req.query;
    const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

    // Paso 1: Cache check
    const cache = await Pelicula.obtenerYoutubeVideos(tmdb_id);
    if (cache && cache.videos[tipo]?.length > 0) {
      const edad = Date.now() - new Date(cache.updated_at).getTime();
      if (edad < TTL_MS) return success(res, { videos: cache.videos[tipo] });
    }

    // Paso 2: Datos de la película
    const pelicula = await Pelicula.buscarPorTmdbId(tmdb_id);
    const tituloOriginal = pelicula?.titulo_original || titulo || '';
    const tituloES      = pelicula?.titulo          || titulo || '';
    const anio          = pelicula?.anio            || '';

    // Paso 3: Queries específicas por tipo — solo en español, sin trailers
    let queries;
    if (tipo === 'profundo') {
      queries = [
        `"${tituloES}" análisis explicación final en español`,
        `"${tituloOriginal}" análisis profundo simbolismo español`,
        `"${tituloES}" final explicado significado`,
        `"${tituloOriginal}" ${anio} análisis cinematográfico español`,
      ];
    } else {
      queries = [
        `"${tituloES}" curiosidades datos interesantes español`,
        `"${tituloOriginal}" easter eggs curiosidades español`,
        `"${tituloES}" detrás de cámaras making of`,
        `"${tituloOriginal}" ${anio} datos curiosos producción`,
      ];
    }

    // Paso 4: Búsqueda en YouTube
    // videoDuration=medium (4-20 min) en modo profundo filtra clips cortos de productoras
    const duracionParam = tipo === 'profundo' ? '&videoDuration=medium' : '';
    const allVideos = [];

    for (const query of queries) {
      if (allVideos.length >= 4) break;

      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3${duracionParam}&relevanceLanguage=es&key=${env.YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        for (const v of data.items) {
          if (!allVideos.some(e => e.id === v.id.videoId)) {
            allVideos.push({
              id:        v.id.videoId,
              titulo:    v.snippet.title,
              canal:     v.snippet.channelTitle,
              thumbnail: v.snippet.thumbnails.medium.url
            });
          }
        }
      }
    }

    const videos = allVideos.slice(0, 4);

    if (videos.length > 0) {
      await Pelicula.actualizarYoutubeVideos(tmdb_id, tipo, videos);
    }

    return success(res, {
      videos,
      ...(videos.length === 0 && { mensaje: 'No se encontraron videos para esta película' })
    });

  } catch (err) {
    console.error('Error buscando YouTube:', err.message);
    return success(res, { videos: [] });
  }
},

};

module.exports = peliculasController;