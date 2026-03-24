const { pool } = require('../config/db');

const Pelicula = {

  // Buscar por título
  async buscarPorTitulo(titulo) {
    const [rows] = await pool.execute(
      `SELECT id, tmdb_id, titulo, anio, director, sinopsis, 
              poster_url, tipo_analisis, calificacion
       FROM peliculas 
       WHERE titulo LIKE ? AND activa = TRUE
       LIMIT 10`,
      [`%${titulo}%`]
    );
    return rows;
  },

  // Buscar por id
  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM peliculas WHERE id = ? AND activa = TRUE',
      [id]
    );
    return rows[0] || null;
  },

  // Buscar por tmdb_id
  async buscarPorTmdbId(tmdb_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM peliculas WHERE tmdb_id = ?',
      [tmdb_id]
    );
    return rows[0] || null;
  },

  // Crear película
  async crear(datos) {
    const {
      tmdb_id, titulo, titulo_original, anio, director,
      duracion_min, sinopsis, calificacion, poster_url,
      keywords, tipo_analisis
    } = datos;

    const [result] = await pool.execute(
      `INSERT INTO peliculas 
       (tmdb_id, titulo, titulo_original, anio, director, duracion_min, 
        sinopsis, calificacion, poster_url, keywords, tipo_analisis)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tmdb_id, titulo, titulo_original, anio, director, duracion_min,
       sinopsis, calificacion, poster_url,
       JSON.stringify(keywords), tipo_analisis]
    );
    return result.insertId;
  },

  // Actualizar tipo de análisis
  async actualizarTipo(id, tipo_analisis, tipo_forzado = false) {
    await pool.execute(
      'UPDATE peliculas SET tipo_analisis = ?, tipo_forzado = ? WHERE id = ?',
      [tipo_analisis, tipo_forzado, id]
    );
  }

};

module.exports = Pelicula;