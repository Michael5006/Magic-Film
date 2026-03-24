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
      'SELECT id, nombre_usuario, email, nombre_completo, rol, nivel_cinefilo, onboarding_completo FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );
    return rows[0] || null;
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
  }

};

module.exports = Usuario;