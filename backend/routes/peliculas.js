const express = require('express');
const router = express.Router();
const peliculasController = require('../controllers/peliculasController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware opcional — no falla si no hay token
const authOpcional = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    const env = require('../config/env');
    try {
      req.usuario = jwt.verify(header.split(' ')[1], env.JWT_SECRET);
    } catch (e) { /* sin token válido */ }
  }
  next();
};

router.get('/buscar', authOpcional, peliculasController.buscar);

// Rutas públicas
router.get('/populares', peliculasController.populares);
router.get('/recientes', peliculasController.recientes);
router.get('/genero/:genero_id', peliculasController.porGenero);
router.get('/youtube/:tmdb_id', peliculasController.youtube);
router.get('/posters-fondo', peliculasController.postersFondo);
router.get('/:tmdb_id/trailer', peliculasController.trailer);
router.get('/:tmdb_id', peliculasController.obtener);

module.exports = router;