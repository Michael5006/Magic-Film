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
  },

  // Obtener videos de YouTube cacheados
  async obtenerYoutubeVideos(tmdb_id) {
    const [rows] = await pool.execute(
      'SELECT youtube_videos, youtube_videos_updated_at FROM peliculas WHERE tmdb_id = ?',
      [tmdb_id]
    );
    const row = rows[0];
    if (!row || !row.youtube_videos) return null;
    return {
      videos: JSON.parse(row.youtube_videos),
      updated_at: row.youtube_videos_updated_at
    };
  },

  // Actualizar caché de videos de YouTube (merge por tipo)
  async actualizarYoutubeVideos(tmdb_id, tipo, videos) {
    const cache = await this.obtenerYoutubeVideos(tmdb_id);
    const existing = (cache && cache.videos) ? cache.videos : {};
    existing[tipo] = videos;
    const [result] = await pool.execute(
      'UPDATE peliculas SET youtube_videos = ?, youtube_videos_updated_at = NOW() WHERE tmdb_id = ?',
      [JSON.stringify(existing), tmdb_id]
    );
    // Si no existe la película en BD, simplemente no actualiza (affectedRows = 0)
    return result;
  }

};

module.exports = Pelicula;