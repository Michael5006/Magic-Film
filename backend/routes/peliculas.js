const express = require('express');
const router = express.Router();
const peliculasController = require('../controllers/peliculasController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/buscar', peliculasController.buscar);
router.get('/:tmdb_id', peliculasController.obtener);

module.exports = router;