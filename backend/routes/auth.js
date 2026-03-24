const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', authController.registro);
router.post('/login',    authController.login);

// Rutas protegidas (requieren token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;