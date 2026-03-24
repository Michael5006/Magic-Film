const { error } = require('../utils/responseHelper');

const adminOnly = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return error(res, 'Acceso denegado. Se requiere rol de administrador', 403);
  }
  next();
};

module.exports = adminOnly;