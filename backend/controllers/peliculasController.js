const Pelicula = require('../models/Pelicula');
const tmdbService = require('../services/tmdbService');
const clasificadorService = require('../services/clasificadorService');
const { success, error } = require('../utils/responseHelper');

const peliculasController = {

  // GET /api/peliculas/buscar?q=titulo
  async buscar(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return error(res, 'El término de búsqueda debe tener al menos 2 caracteres', 400);
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
      const peliculas = resultadosTMDB.slice(0, 5).map(p => ({
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
  }

};

module.exports = peliculasController;