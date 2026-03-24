const Analisis = require('../models/Analisis');
const Pelicula = require('../models/Pelicula');
const geminiService = require('../services/geminiService');
const { success, error } = require('../utils/responseHelper');
const env = require('../config/env');

const analisisController = {

  // GET /api/analisis/:pelicula_id
  async obtener(req, res) {
    try {
      const { pelicula_id } = req.params;

      const analisis = await Analisis.obtenerCompleto(pelicula_id);

      if (!analisis) {
        return error(res, 'No existe análisis para esta película', 404);
      }

      return success(res, { analisis });

    } catch (err) {
      console.error('Error en obtener análisis:', err.message);
      return error(res, 'Error al obtener análisis', 500);
    }
  },

  // POST /api/analisis/generar/:pelicula_id
  async generar(req, res) {
    try {
      const { pelicula_id } = req.params;

      // Verificar que la película existe
      const pelicula = await Pelicula.buscarPorId(pelicula_id);
      if (!pelicula) {
        return error(res, 'Película no encontrada', 404);
      }

      // Verificar si ya existe un análisis completo
      const existente = await Analisis.buscarPorPelicula(pelicula_id);
      if (existente && existente.estado === 'completo') {
        const completo = await Analisis.obtenerCompleto(pelicula_id);
        return success(res, { 
          analisis: completo, 
          mensaje: 'Análisis recuperado de base de datos' 
        });
      }

      // Crear registro de análisis en estado pendiente
      const analisis_id = await Analisis.crear(pelicula_id, pelicula.tipo_analisis, env.GROQ_MODEL);

      // Actualizar estado a generando
      await Analisis.actualizarEstado(analisis_id, 'generando');

      // Enriquecer con datos reales de TMDB
      const tmdbService = require('../services/tmdbService');
      const datosCompletos = await tmdbService.obtenerDatosCompletos(pelicula.tmdb_id);
      const peliculaEnriquecida = { ...pelicula, ...datosCompletos };

      // Generar análisis con datos enriquecidos
      const resultado = await geminiService.generarAnalisis(peliculaEnriquecida, pelicula.tipo_analisis);

      // Llamar a Gemini
      const { capas, prompt, tiempo_ms } = await geminiService.generarAnalisis(
        pelicula,
        pelicula.tipo_analisis
      );

      // Guardar capas
      await Analisis.guardarCapas(analisis_id, capas, pelicula.tipo_analisis);

      // Actualizar estado a completo
      await Analisis.actualizarEstado(analisis_id, 'completo');

      // Registrar log
      await Analisis.registrarLog(analisis_id, prompt, tiempo_ms);

      // Devolver análisis completo
      const analisisCompleto = await Analisis.obtenerCompleto(pelicula_id);

      return success(res, {
        analisis: analisisCompleto,
        mensaje: 'Análisis generado correctamente',
        tiempo_ms
      }, 201);

    } catch (err) {
      console.error('Error generando análisis:', err.message);
      return error(res, 'Error al generar análisis', 500);
    }
  }

};

module.exports = analisisController;