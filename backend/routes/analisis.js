const express = require('express');
const router = express.Router();
const analisisController = require('../controllers/analisisController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ver análisis existente (público)
router.get('/:pelicula_id', analisisController.obtener);

// Generar análisis (requiere login)
router.post('/generar/:pelicula_id', authMiddleware, analisisController.generar);

module.exports = router;