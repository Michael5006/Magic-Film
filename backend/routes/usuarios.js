const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas requieren login
router.use(authMiddleware);

router.get('/perfil',                    usuariosController.perfil);
router.get('/favoritos',                 usuariosController.favoritos);
router.post('/favoritos/:pelicula_id',   usuariosController.agregarFavorito);
router.delete('/favoritos/:pelicula_id', usuariosController.eliminarFavorito);
router.post('/onboarding',               usuariosController.completarOnboarding);

module.exports = router;