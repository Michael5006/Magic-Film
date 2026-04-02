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
        } catch (e) {}
      }

      const enBD = await Pelicula.buscarPorTitulo(q);
      if (enBD.length > 0) {
        return success(res, { peliculas: enBD, fuente: 'base_de_datos' });
      }

      const resultadosTMDB = await tmdbService.buscarPelicula(q);

      if (resultadosTMDB.length === 0) {
        return success(res, { peliculas: [], fuente: 'tmdb' });
      }

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

      let pelicula = await Pelicula.buscarPorTmdbId(tmdb_id);

      if (!pelicula) {
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

  // GET /api/peliculas/:tmdb_id/youtube
  async youtube(req, res) {
    try {
      const { tmdb_id } = req.params;
      const { tipo, titulo } = req.query;
      const TTL_MS = 30 * 24 * 60 * 60 * 1000;

      const cache = await Pelicula.obtenerYoutubeVideos(tmdb_id);
      if (cache && cache.videos[tipo]?.length > 0) {
        const edad = Date.now() - new Date(cache.updated_at).getTime();
        if (edad < TTL_MS) return success(res, { videos: cache.videos[tipo] });
      }

      const pelicula = await Pelicula.buscarPorTmdbId(tmdb_id);
      const tituloOriginal = pelicula?.titulo_original || titulo || '';
      const tituloES = pelicula?.titulo || titulo || '';
      const anio = pelicula?.anio || '';

      let queries = tipo === 'profundo'
        ? [
            `"${tituloES}" análisis explicación final español -trailer -clip -shorts`,
            `"${tituloOriginal}" análisis profundo simbolismo español -trailer`,
          ]
        : [
            `"${tituloES}" curiosidades datos interesantes español -trailer -clip -shorts`,
            `"${tituloOriginal}" easter eggs curiosidades español -trailer`,
          ];

      const allVideos = [];

      function esShort(duration) {
        const match = duration.match(/PT(\d+M)?(\d+S)?/);
        const minutos = match && match[1] ? parseInt(match[1]) : 0;
        return minutos < 3;
      }

      function esRelevante(video, titulo) {
        const text = (
          video.snippet.title +
          ' ' +
          video.snippet.description +
          ' ' +
          video.snippet.channelTitle
        ).toLowerCase();

        const palabras = titulo.toLowerCase().split(' ');
        return palabras.filter(p => text.includes(p)).length >= 2;
      }

      for (const query of queries) {
        if (allVideos.length >= 4) break;

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&relevanceLanguage=es&videoEmbeddable=true&key=${env.YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) continue;

        const ids = data.items.map(v => v.id.videoId).join(',');

        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${env.YOUTUBE_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        for (const v of detailsData.items || []) {
          if (allVideos.length >= 4) break;

          if (esShort(v.contentDetails.duration)) continue;
          if (!esRelevante(v, tituloES || tituloOriginal)) continue;
          if (allVideos.some(e => e.id === v.id)) continue;

          allVideos.push({
            id: v.id,
            titulo: v.snippet.title,
            canal: v.snippet.channelTitle,
            thumbnail: v.snippet.thumbnails.medium.url
          });
        }
      }

      const videos = allVideos.slice(0, 4);

      if (videos.length > 0) {
        await Pelicula.actualizarYoutubeVideos(tmdb_id, tipo, videos);
      }

      return success(res, { videos });

    } catch (err) {
      console.error('Error buscando YouTube:', err.message);
      return success(res, { videos: [] });
    }
  }

};

module.exports = peliculasController;