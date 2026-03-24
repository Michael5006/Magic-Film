const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { error } = require('../utils/responseHelper');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.usuario = decoded;

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expirado, inicia sesión nuevamente', 401);
    }
    return error(res, 'Token inválido', 401);
  }
};

module.exports = authMiddleware;