const { pool } = require('../config/db');

const Analisis = {

  // Buscar análisis por pelicula_id
  async buscarPorPelicula(pelicula_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM analisis 
       WHERE pelicula_id = ? AND eliminado = FALSE`,
      [pelicula_id]
    );
    return rows[0] || null;
  },

  // Crear análisis
 async crear(pelicula_id, tipo, modelo) {
    const [result] = await pool.execute(
      `INSERT INTO analisis (pelicula_id, tipo, estado, modelo_ia) 
       VALUES (?, ?, 'pendiente', ?)`,
      [pelicula_id, tipo, modelo]
    );
    return result.insertId;
  },

  // Actualizar estado
  async actualizarEstado(id, estado) {
    await pool.execute(
      'UPDATE analisis SET estado = ? WHERE id = ?',
      [estado, id]
    );
  },

  // Guardar capas del análisis
  async guardarCapas(analisis_id, capas, modo) {
    const entries = Object.entries(capas);
    for (let i = 0; i < entries.length; i++) {
      const [nombre_capa, contenido] = entries[i];
      await pool.execute(
        `INSERT INTO capas_analisis 
         (analisis_id, modo, nombre_capa, contenido, orden)
         VALUES (?, ?, ?, ?, ?)`,
        [analisis_id, modo, nombre_capa, contenido, i + 1]
      );
    }
  },

  // Obtener análisis completo con capas
  async obtenerCompleto(pelicula_id) {
    const [analisis] = await pool.execute(
      'SELECT * FROM analisis WHERE pelicula_id = ? AND eliminado = FALSE',
      [pelicula_id]
    );

    if (!analisis[0]) return null;

    const [capas] = await pool.execute(
      'SELECT nombre_capa, contenido, orden FROM capas_analisis WHERE analisis_id = ? ORDER BY orden',
      [analisis[0].id]
    );

    return { ...analisis[0], capas };
  },

  // Registrar log de IA
  async registrarLog(analisis_id, prompt, tiempo_ms) {
    await pool.execute(
      `INSERT INTO log_ia (analisis_id, prompt_usado, tiempo_ms)
       VALUES (?, ?, ?)`,
      [analisis_id, prompt, tiempo_ms]
    );
  }

};

module.exports = Analisis;