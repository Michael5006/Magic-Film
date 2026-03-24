const { pool } = require('../config/db');

const Favorito = {

  async agregar(usuario_id, pelicula_id) {
    const [result] = await pool.execute(
      `INSERT INTO favoritos (usuario_id, pelicula_id) 
       VALUES (?, ?)`,
      [usuario_id, pelicula_id]
    );
    return result.insertId;
  },

  async eliminar(usuario_id, pelicula_id) {
    await pool.execute(
      `DELETE FROM favoritos 
       WHERE usuario_id = ? AND pelicula_id = ?`,
      [usuario_id, pelicula_id]
    );
  },

  async listarPorUsuario(usuario_id) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.tmdb_id, p.titulo, p.anio, 
              p.poster_url, p.tipo_analisis, p.calificacion,
              f.guardado_en
       FROM favoritos f
       JOIN peliculas p ON f.pelicula_id = p.id
       WHERE f.usuario_id = ?
       ORDER BY f.guardado_en DESC`,
      [usuario_id]
    );
    return rows;
  },

  async existe(usuario_id, pelicula_id) {
    const [rows] = await pool.execute(
      `SELECT id FROM favoritos 
       WHERE usuario_id = ? AND pelicula_id = ?`,
      [usuario_id, pelicula_id]
    );
    return rows.length > 0;
  }

};

module.exports = Favorito;