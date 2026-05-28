const { pool } = require('../config/db');

const Usuario = {

  // Crear usuario nuevo
  async crear(datos) {
    const { nombre_usuario, email, password_hash, nombre_completo } = datos;
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre_usuario, email, password_hash, nombre_completo) 
       VALUES (?, ?, ?, ?)`,
      [nombre_usuario, email, password_hash, nombre_completo]
    );
    return result.insertId;
  },

  // Buscar por email
  async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );
    return rows[0] || null;
  },

  // Buscar por id
  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT id, nombre_usuario, email, nombre_completo, rol, nivel_cinefilo, onboarding_completo, foto_perfil, bio FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );
    return rows[0] || null;
  },

  // Actualizar datos de perfil (nombre_usuario, nombre_completo, bio)
  async actualizarDatosPerfil(id, datos) {
    const { nombre_usuario, nombre_completo, bio } = datos;
    await pool.execute(
      'UPDATE usuarios SET nombre_usuario = ?, nombre_completo = ?, bio = ? WHERE id = ?',
      [nombre_usuario, nombre_completo, bio ?? null, id]
    );
  },

  // Actualizar foto de perfil (base64 data URL)
  async actualizarFoto(id, foto_perfil) {
    await pool.execute(
      'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
      [foto_perfil, id]
    );
  },

  // Buscar por nombre de usuario
  async buscarPorUsername(nombre_usuario) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = TRUE',
      [nombre_usuario]
    );
    return rows[0] || null;
  },

  // Actualizar onboarding completo
  async completarOnboarding(id) {
    await pool.execute(
      'UPDATE usuarios SET onboarding_completo = TRUE WHERE id = ?',
      [id]
    );
  },

  // Obtener géneros del usuario
  async obtenerGeneros(usuario_id) {
    const [rows] = await pool.execute(
        `SELECT genero_id AS id, genero_nombre AS nombre 
         FROM usuario_generos 
         WHERE usuario_id = ?`,
        [usuario_id]
    );
    return rows;
},

  async actualizarNivel(id, nivel_cinefilo) {
    await pool.execute(
      'UPDATE usuarios SET nivel_cinefilo = ? WHERE id = ?',
      [nivel_cinefilo, id]
    );
  },

  // ── Reset de contraseña ──────────────────────────────────

  async guardarResetToken(id, token, expira) {
    await pool.execute(
      'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE id = ?',
      [token, expira, id]
    );
  },

  async buscarPorResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expira > NOW() AND activo = TRUE',
      [token]
    );
    return rows[0] || null;
  },

  async actualizarPassword(id, password_hash) {
    await pool.execute(
      'UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expira = NULL WHERE id = ?',
      [password_hash, id]
    );
  },

  // ── Verificación de email ────────────────────────────────

  async guardarTokenVerificacion(id, token, expira) {
    await pool.execute(
      'UPDATE usuarios SET token_verificacion = ?, token_verificacion_expira = ? WHERE id = ?',
      [token, expira, id]
    );
  },

  async buscarPorTokenVerificacion(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE token_verificacion = ? AND token_verificacion_expira > NOW() AND activo = TRUE',
      [token]
    );
    return rows[0] || null;
  },

  async verificarEmail(id) {
    await pool.execute(
      'UPDATE usuarios SET email_verificado = TRUE, token_verificacion = NULL, token_verificacion_expira = NULL WHERE id = ?',
      [id]
    );
  },

  // ── Google OAuth ─────────────────────────────────────────

  async buscarPorGoogleId(google_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE google_id = ? AND activo = TRUE',
      [google_id]
    );
    return rows[0] || null;
  },

  async crearConGoogle(datos) {
    const { nombre_usuario, email, nombre_completo, google_id } = datos;
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre_usuario, email, nombre_completo, google_id, email_verificado)
       VALUES (?, ?, ?, ?, TRUE)`,
      [nombre_usuario, email, nombre_completo, google_id]
    );
    return result.insertId;
  },

  async vincularGoogle(id, google_id) {
    await pool.execute(
      'UPDATE usuarios SET google_id = ?, email_verificado = TRUE WHERE id = ?',
      [google_id, id]
    );
  },

  async eliminar(id) {
    await pool.execute(
      'UPDATE usuarios SET activo = FALSE WHERE id = ?',
      [id]
    );
  },

};


module.exports = Usuario;