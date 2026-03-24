const Usuario = require('../models/Usuario');
const Favorito = require('../models/Favorito');
const Analisis = require('../models/Analisis');
const { pool } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

const usuariosController = {

    // GET /api/usuarios/generos
  async generos(req, res) {
    try {
      const generos = await Usuario.obtenerGeneros(req.usuario.id);
      return success(res, { generos });
    } catch (err) {
      console.error('Error en generos:', err.message);
      return error(res, 'Error al obtener géneros', 500);
    }
  },

  // GET /api/usuarios/perfil
  async perfil(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      if (!usuario) {
        return error(res, 'Usuario no encontrado', 404);
      }
      return success(res, { usuario });
    } catch (err) {
      console.error('Error en perfil:', err.message);
      return error(res, 'Error al obtener perfil', 500);
    }
  },

  // GET /api/usuarios/favoritos
  async favoritos(req, res) {
    try {
      const favoritos = await Favorito.listarPorUsuario(req.usuario.id);
      return success(res, { favoritos });
    } catch (err) {
      console.error('Error en favoritos:', err.message);
      return error(res, 'Error al obtener favoritos', 500);
    }
  },

  // POST /api/usuarios/favoritos/:pelicula_id
  async agregarFavorito(req, res) {
    try {
      const { pelicula_id } = req.params;

      const existe = await Favorito.existe(req.usuario.id, pelicula_id);
      if (existe) {
        return error(res, 'La película ya está en favoritos', 409);
      }

      await Favorito.agregar(req.usuario.id, pelicula_id);
      return success(res, { mensaje: 'Película agregada a favoritos' }, 201);

    } catch (err) {
      console.error('Error agregando favorito:', err.message);
      return error(res, 'Error al agregar favorito', 500);
    }
  },

  // DELETE /api/usuarios/favoritos/:pelicula_id
  async eliminarFavorito(req, res) {
    try {
      const { pelicula_id } = req.params;
      await Favorito.eliminar(req.usuario.id, pelicula_id);
      return success(res, { mensaje: 'Película eliminada de favoritos' });
    } catch (err) {
      console.error('Error eliminando favorito:', err.message);
      return error(res, 'Error al eliminar favorito', 500);
    }
  },

  // POST /api/usuarios/onboarding
 async completarOnboarding(req, res) {
  try {
    const { generos, nivel_cinefilo } = req.body;

    if (!generos || generos.length !== 3) {
      return error(res, 'Debes seleccionar exactamente 3 géneros', 400);
    }

    for (const genero_id of generos) {
      await pool.execute(
        `INSERT IGNORE INTO usuario_generos (usuario_id, genero_id) 
         VALUES (?, ?)`,
        [req.usuario.id, genero_id]
      );
    }

    await Usuario.completarOnboarding(req.usuario.id);

    if (nivel_cinefilo) {
      await Usuario.actualizarNivel(req.usuario.id, nivel_cinefilo);
    }

    return success(res, { mensaje: 'Onboarding completado correctamente' });

  } catch (err) {
    console.error('Error en onboarding:', err.message);
    return error(res, 'Error al completar onboarding', 500);
  }
},

async historial(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT h.termino_buscado, h.buscado_en, p.tmdb_id
       FROM historial_busquedas h
       LEFT JOIN peliculas p ON h.pelicula_id = p.id
       WHERE h.usuario_id = ?
       ORDER BY h.buscado_en DESC
       LIMIT 20`,
      [req.usuario.id]
    );
    return success(res, { historial: rows });
  } catch (err) {
    console.error('Error en historial:', err.message);
    return error(res, 'Error al obtener historial', 500);
  }
}

};

module.exports = usuariosController;