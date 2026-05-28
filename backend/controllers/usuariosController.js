const Usuario = require('../models/Usuario');
const Favorito = require('../models/Favorito');
const Analisis = require('../models/Analisis');
const { pool } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

const usuariosController = {

    // GET /api/usuarios/comunidad  (público — sin auth)
    async comunidad(req, res) {
        try {
            const [[{ total }]] = await pool.execute(
                'SELECT COUNT(*) as total FROM usuarios WHERE activo = TRUE AND rol != "invitado"'
            );
            const [recientes] = await pool.execute(
                `SELECT id, nombre_completo, nombre_usuario
                 FROM usuarios
                 WHERE activo = TRUE AND rol != "invitado"
                 ORDER BY creado_en DESC
                 LIMIT 4`
            );
            return success(res, { total, recientes });
        } catch (err) {
            console.error('Error en comunidad:', err.message);
            return error(res, 'Error al obtener datos de comunidad', 500);
        }
    },

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
        if (!usuario) return error(res, 'Usuario no encontrado', 404);

        // Incluir géneros en el perfil
        const generos = await Usuario.obtenerGeneros(req.usuario.id);
        usuario.generos_favoritos = generos;

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

        // Limpiar géneros anteriores por si repite el onboarding
        await pool.execute(
            'DELETE FROM usuario_generos WHERE usuario_id = ?',
            [req.usuario.id]
        );

        for (const genero of generos) {
            // Soporta tanto {id, nombre} como número plano
            const generoId = genero.id ?? genero;
            const generoNombre = genero.nombre ?? '';

            await pool.execute(
                `INSERT IGNORE INTO usuario_generos (usuario_id, genero_id, genero_nombre) 
                 VALUES (?, ?, ?)`,
                [req.usuario.id, generoId, generoNombre]
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
},

// DELETE /api/usuarios/historial
async limpiarHistorial(req, res) {
    try {
        await pool.execute(
            'DELETE FROM historial_busquedas WHERE usuario_id = ?',
            [req.usuario.id]
        );
        return success(res, { mensaje: 'Historial eliminado correctamente' });
    } catch (err) {
        console.error('Error limpiando historial:', err.message);
        return error(res, 'Error al limpiar historial', 500);
    }
},

// PUT /api/usuarios/perfil
async actualizarPerfil(req, res) {
    try {
        const { nombre_usuario, nombre_completo, bio } = req.body;

        if (!nombre_usuario || !nombre_completo) {
            return error(res, 'El nombre de usuario y nombre completo son obligatorios', 400);
        }
        if (nombre_usuario.length < 3 || nombre_usuario.length > 50) {
            return error(res, 'El nombre de usuario debe tener entre 3 y 50 caracteres', 400);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(nombre_usuario)) {
            return error(res, 'El nombre de usuario solo puede tener letras, números y guión bajo', 400);
        }
        if (bio && bio.length > 300) {
            return error(res, 'La bio no puede superar 300 caracteres', 400);
        }

        // Verificar que el nuevo username no lo use otro usuario
        const existente = await Usuario.buscarPorUsername(nombre_usuario);
        if (existente && existente.id !== req.usuario.id) {
            return error(res, 'Ese nombre de usuario ya está en uso', 409);
        }

        await Usuario.actualizarDatosPerfil(req.usuario.id, {
            nombre_usuario,
            nombre_completo,
            bio: bio || null
        });

        return success(res, {
            mensaje: 'Perfil actualizado correctamente',
            usuario: { nombre_usuario, nombre_completo, bio }
        });

    } catch (err) {
        console.error('Error actualizando perfil:', err.message);
        return error(res, 'Error al actualizar perfil', 500);
    }
},

// PUT /api/usuarios/password
async cambiarPassword(req, res) {
    try {
        const { password_actual, password_nueva } = req.body;
        if (!password_actual || !password_nueva) {
            return error(res, 'Ambas contraseñas son obligatorias', 400);
        }
        if (password_nueva.length < 6) {
            return error(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400);
        }

        const usuario = await Usuario.buscarPorId(req.usuario.id);
        if (!usuario) return error(res, 'Usuario no encontrado', 404);

        // Usuarios de Google no tienen contraseña
        if (!usuario.password_hash) {
            return error(res, 'Tu cuenta usa Google para iniciar sesión. No puedes cambiar la contraseña aquí.', 400);
        }

        const bcrypt = require('bcryptjs');
        const valida = await bcrypt.compare(password_actual, usuario.password_hash);
        if (!valida) return error(res, 'La contraseña actual es incorrecta', 401);

        const password_hash = await bcrypt.hash(password_nueva, 10);
        await Usuario.actualizarPassword(req.usuario.id, password_hash);

        return success(res, { mensaje: 'Contraseña actualizada correctamente' });

    } catch (err) {
        console.error('Error cambiando contraseña:', err.message);
        return error(res, 'Error al cambiar contraseña', 500);
    }
},

// DELETE /api/usuarios/cuenta
async eliminarCuenta(req, res) {
    try {
        const { password } = req.body;
        const usuario = await Usuario.buscarPorId(req.usuario.id);
        if (!usuario) return error(res, 'Usuario no encontrado', 404);

        // Si tiene contraseña, exigirla para confirmar
        if (usuario.password_hash) {
            if (!password) return error(res, 'Ingresa tu contraseña para confirmar', 400);
            const bcrypt = require('bcryptjs');
            const valida = await bcrypt.compare(password, usuario.password_hash);
            if (!valida) return error(res, 'Contraseña incorrecta', 401);
        }

        await Usuario.eliminar(req.usuario.id);
        return success(res, { mensaje: 'Cuenta eliminada correctamente' });

    } catch (err) {
        console.error('Error eliminando cuenta:', err.message);
        return error(res, 'Error al eliminar cuenta', 500);
    }
},

// PUT /api/usuarios/foto
async actualizarFoto(req, res) {
    try {
        const { foto_perfil } = req.body;
        if (!foto_perfil) {
            return error(res, 'foto_perfil es requerida', 400);
        }
        // Validar que sea una data URL de imagen
        if (!foto_perfil.startsWith('data:image/')) {
            return error(res, 'Formato de imagen inválido', 400);
        }
        await Usuario.actualizarFoto(req.usuario.id, foto_perfil);
        return success(res, { mensaje: 'Foto actualizada correctamente' });
    } catch (err) {
        console.error('Error actualizando foto:', err.message);
        return error(res, 'Error al actualizar foto', 500);
    }
}

};

module.exports = usuariosController;