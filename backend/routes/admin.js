const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');

// Todas las rutas requieren auth + rol admin
router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats',                      adminController.stats);
router.get('/usuarios',                   adminController.listarUsuarios);
router.put('/usuarios/:id',               adminController.editarUsuario);
router.put('/usuarios/:id/generos',       adminController.editarGenerosUsuario);
router.delete('/usuarios/:id',            adminController.eliminarUsuario);
router.get('/peliculas',                  adminController.listarPeliculas);
router.put('/peliculas/:id',              adminController.editarPelicula);
router.get('/peliculas/:id/analisis',     adminController.obtenerCapasAnalisis);
router.delete('/peliculas/:id',           adminController.eliminarPelicula);
router.delete('/analisis/:id',            adminController.eliminarAnalisis);
router.put('/capas/:id',                  adminController.editarCapa);
router.get('/historial',                  adminController.historial);

module.exports = router;