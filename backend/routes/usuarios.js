const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta pública (antes del middleware de auth)
router.get('/comunidad', usuariosController.comunidad);

// Todas las siguientes requieren login
router.use(authMiddleware);

router.get('/perfil',                    usuariosController.perfil);
router.get('/favoritos',                 usuariosController.favoritos);
router.get('/generos',                   usuariosController.generos);
router.get('/historial',                 usuariosController.historial);
router.delete('/historial',              usuariosController.limpiarHistorial);
router.post('/favoritos/:pelicula_id',   usuariosController.agregarFavorito);
router.delete('/favoritos/:pelicula_id', usuariosController.eliminarFavorito);
router.post('/onboarding',               usuariosController.completarOnboarding);
router.put('/perfil',                    usuariosController.actualizarPerfil);
router.put('/password',                  usuariosController.cambiarPassword);
router.delete('/cuenta',                 usuariosController.eliminarCuenta);
router.put('/foto',                      usuariosController.actualizarFoto);

module.exports = router;