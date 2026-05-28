const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/enviar-codigo',    authController.enviarCodigo);
router.post('/registro',         authController.registro);
router.post('/login',            authController.login);
router.post('/forgot-password',  authController.forgotPassword);
router.post('/reset-password',   authController.resetPassword);
router.get('/verificar-email',   authController.verificarEmail);
router.post('/google',           authController.googleAuth);

// Rutas protegidas (requieren token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;