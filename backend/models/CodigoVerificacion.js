const { pool } = require('../config/db');

const CodigoVerificacion = {

  async guardar(email, codigo, expira) {
    // Eliminar códigos anteriores del mismo email antes de insertar
    await pool.execute('DELETE FROM codigos_verificacion WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO codigos_verificacion (email, codigo, expira_en) VALUES (?, ?, ?)',
      [email, codigo, expira]
    );
  },

  async verificar(email, codigo) {
    const [rows] = await pool.execute(
      'SELECT * FROM codigos_verificacion WHERE email = ? AND codigo = ? AND expira_en > NOW()',
      [email, codigo]
    );
    return rows[0] || null;
  },

  async eliminar(email) {
    await pool.execute('DELETE FROM codigos_verificacion WHERE email = ?', [email]);
  }

};

module.exports = CodigoVerificacion;
