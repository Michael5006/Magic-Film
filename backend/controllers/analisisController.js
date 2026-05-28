const Analisis = require('../models/Analisis');
const Pelicula = require('../models/Pelicula');
const geminiService = require('../services/geminiService');
const tmdbService = require('../services/tmdbService');
const { pool } = require('../config/db');
const { success, error } = require('../utils/responseHelper');
const env = require('../config/env');

// Valida que todas las capas requeridas existan y tengan contenido
function validarCapas(capas, tipo) {
    const requeridas = tipo === 'profundo'
        ? ['narrativa', 'simbolismo', 'momentos', 'contexto', 'tecnica', 'conclusion']
        : ['resumen', 'momentos', 'easter_eggs', 'curiosidades'];

    for (const capa of requeridas) {
        if (!capas[capa]) return { valido: false, faltante: capa };

        const contenido = capas[capa];
        if (typeof contenido === 'string' && contenido.trim().length < 10) {
            return { valido: false, faltante: capa };
        }
        if (typeof contenido === 'object') {
            const str = JSON.stringify(contenido);
            if (str.length < 20) return { valido: false, faltante: capa };
        }
    }

    return { valido: true };
}

const analisisController = {

    // GET /api/analisis/:pelicula_id
    async obtener(req, res) {
        try {
            const { pelicula_id } = req.params;
            const analisis = await Analisis.obtenerCompleto(pelicula_id);
            if (!analisis) return error(res, 'No existe análisis para esta película', 404);
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

            const pelicula = await Pelicula.buscarPorId(pelicula_id);
            if (!pelicula) return error(res, 'Película no encontrada', 404);

            const media_type = pelicula.media_type || 'movie'; 
            const esTV       = media_type === 'tv';               

            // ── Helper: actualizar historial ──────────────────────────
            const actualizarHistorial = async () => {
                if (!req.usuario) return;
                try {
                    const [result] = await pool.execute(
                        `UPDATE historial_busquedas 
                         SET pelicula_id = ?
                         WHERE usuario_id = ? 
                         AND pelicula_id IS NULL
                         AND (
                             ? LIKE CONCAT('%', CONVERT(termino_buscado USING utf8mb4), '%')
                             OR CONVERT(termino_buscado USING utf8mb4) LIKE CONCAT('%', CONVERT(SUBSTRING(?, 1, 8) USING utf8mb4), '%')
                         )
                         ORDER BY buscado_en DESC LIMIT 3`,
                        [pelicula_id, req.usuario.id, pelicula.titulo, pelicula.titulo]
                    );
                    console.log('Historial actualizado:', result.affectedRows, 'filas | titulo:', pelicula.titulo);
                } catch (e) {
                    console.error('Error actualizando historial:', e.message);
                }
            };

            // ── Helper: asegurar reparto y similares ──────────────────
            const asegurarDatosVisuales = async () => {
                const faltaReparto   = !pelicula.reparto?.length;
                const faltaSimilares = !pelicula.similares?.length;
                if (!faltaReparto && !faltaSimilares) return;

                try {
                    const datosExtra = esTV
                    ? await tmdbService.obtenerDatosCompletosSerie(pelicula.tmdb_id, pelicula.tipo_analisis)
                    : await tmdbService.obtenerDatosCompletos(pelicula.tmdb_id, pelicula.tipo_analisis);

                    if (faltaReparto && datosExtra.reparto?.length > 0) {
                        await pool.execute(
                            'UPDATE peliculas SET reparto = ? WHERE id = ?',
                            [JSON.stringify(datosExtra.reparto), pelicula_id]
                        );
                        pelicula.reparto = datosExtra.reparto;
                    }

                    if (faltaSimilares && datosExtra.similares?.length > 0) {
                        await pool.execute(
                            'UPDATE peliculas SET similares = ? WHERE id = ?',
                            [JSON.stringify(datosExtra.similares), pelicula_id]
                        );
                        pelicula.similares = datosExtra.similares;
                    }
                } catch (e) {
                    console.error('Error obteniendo datos visuales:', e.message);
                }
            };

            // ── Si ya existe análisis completo, retornarlo ────────────
            const force     = req.body?.force === true || req.query?.force === 'true';
            const existente = await Analisis.buscarPorPelicula(pelicula_id);
            if (existente && existente.estado === 'completo' && !force) {
                const completo = await Analisis.obtenerCompleto(pelicula_id);
                await asegurarDatosVisuales();
                completo.reparto   = pelicula.reparto   || null;
                completo.similares = pelicula.similares || null;
                await actualizarHistorial();
                return success(res, {
                    analisis: completo,
                    mensaje: 'Análisis recuperado de base de datos'
                });
            }
            if (existente && existente.estado === 'completo' && force) {
                await Analisis.eliminarCapas(existente.id);
                await Analisis.actualizarEstado(existente.id, 'generando');
            }

            // ── Crear o reutilizar análisis ───────────────────────────
            let analisis_id;
            if (existente) {
                analisis_id = existente.id;
                await Analisis.eliminarCapas(analisis_id);
            } else {
                analisis_id = await Analisis.crear(pelicula_id, pelicula.tipo_analisis, env.GROQ_MODEL);
            }
            await Analisis.actualizarEstado(analisis_id, 'generando');

            // ── Enriquecer con datos de TMDB ──────────────────────────
            const datosCompletos = esTV
            ? await tmdbService.obtenerDatosCompletosSerie(pelicula.tmdb_id, pelicula.tipo_analisis)
            : await tmdbService.obtenerDatosCompletos(pelicula.tmdb_id, pelicula.tipo_analisis);
            const peliculaEnriquecida = { ...pelicula, ...datosCompletos };

            if (datosCompletos.reparto?.length > 0) {
                await pool.execute(
                    'UPDATE peliculas SET reparto = ? WHERE id = ?',
                    [JSON.stringify(datosCompletos.reparto), pelicula_id]
                );
                pelicula.reparto = datosCompletos.reparto;
            }

            if (datosCompletos.similares?.length > 0) {
                await pool.execute(
                    'UPDATE peliculas SET similares = ? WHERE id = ?',
                    [JSON.stringify(datosCompletos.similares), pelicula_id]
                );
                pelicula.similares = datosCompletos.similares;
            }

            // ── Generar análisis con IA ───────────────────────────────
            const { capas, prompt, tiempo_ms } = await geminiService.generarAnalisis(
            peliculaEnriquecida,
            pelicula.tipo_analisis,
            media_type
            );
            console.log(`[analisis] capas generadas (${pelicula.tipo_analisis}):`, Object.keys(capas));

            // Validar capas completas — reintentar si faltan
            const validacion = validarCapas(capas, pelicula.tipo_analisis);
            if (!validacion.valido) {
                console.warn(`Análisis incompleto — falta capa: ${validacion.faltante}. Reintentando...`);

                const reintento = await geminiService.generarAnalisis(peliculaEnriquecida, pelicula.tipo_analisis, media_type);
                const validacionReintento = validarCapas(reintento.capas, pelicula.tipo_analisis);

                if (!validacionReintento.valido) {
                    await Analisis.actualizarEstado(analisis_id, 'error');
                    return error(res, 'No se pudo generar el análisis completo. Intenta de nuevo.', 500);
                }

                await Analisis.guardarCapas(analisis_id, reintento.capas, pelicula.tipo_analisis);
                await Analisis.actualizarEstado(analisis_id, 'completo');
                await Analisis.registrarLog(analisis_id, reintento.prompt, reintento.tiempo_ms);
            } else {
                await Analisis.guardarCapas(analisis_id, capas, pelicula.tipo_analisis);
                await Analisis.actualizarEstado(analisis_id, 'completo');
                await Analisis.registrarLog(analisis_id, prompt, tiempo_ms);
            }

            const analisisCompleto = await Analisis.obtenerCompleto(pelicula_id);
            analisisCompleto.reparto   = pelicula.reparto   || null;
            analisisCompleto.similares = pelicula.similares || null;
            await actualizarHistorial();

            return success(res, {
                analisis: analisisCompleto,
                mensaje: 'Análisis generado correctamente',
                tiempo_ms
            }, 201);

        } catch (err) {
            console.error('Error generando análisis:', err.message, err.stack);
            return error(res, `Error al generar análisis: ${err.message}`, 500);
        }
    }
};

module.exports = analisisController;