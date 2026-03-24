const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Error de duplicado en MySQL (email o usuario ya existe)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      ok: false,
      error: 'Ya existe un registro con esos datos'
    });
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      error: 'Token inválido'
    });
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      error: 'Token expirado, inicia sesión nuevamente'
    });
  }

  // Error genérico
  return res.status(500).json({
    ok: false,
    error: 'Error interno del servidor'
  });
};

module.exports = errorHandler;