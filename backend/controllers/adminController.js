const { pool } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

const adminController = {

    // GET /api/admin/stats
    async stats(req, res) {
        try {
            const [[{ total_usuarios }]] = await pool.execute('SELECT COUNT(*) as total_usuarios FROM usuarios WHERE activo = TRUE');
            const [[{ total_peliculas }]] = await pool.execute('SELECT COUNT(*) as total_peliculas FROM peliculas');
            const [[{ total_analisis }]] = await pool.execute('SELECT COUNT(*) as total_analisis FROM analisis WHERE estado = "completo"');
            const [[{ analisis_pendientes }]] = await pool.execute('SELECT COUNT(*) as analisis_pendientes FROM analisis WHERE estado != "completo"');

            return success(res, { stats: { total_usuarios, total_peliculas, total_analisis, analisis_pendientes } });
        } catch (err) {
            console.error('Error en stats:', err.message);
            return error(res, 'Error al obtener estadísticas', 500);
        }
    },

    // GET /api/admin/usuarios
    async listarUsuarios(req, res) {
        try {
            const [rows] = await pool.execute(
                `SELECT id, nombre_usuario, email, nombre_completo, rol, nivel_cinefilo, 
                        onboarding_completo, activo, creado_en 
                 FROM usuarios ORDER BY creado_en DESC`
            );
            return success(res, { usuarios: rows });
        } catch (err) {
            console.error('Error listando usuarios:', err.message);
            return error(res, 'Error al obtener usuarios', 500);
        }
    },

    // DELETE /api/admin/usuarios/:id
    async eliminarUsuario(req, res) {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.usuario.id) {
            return error(res, 'No puedes eliminarte a ti mismo', 400);
        }

        const [[usuario]] = await pool.execute('SELECT id, nombre_usuario FROM usuarios WHERE id = ?', [id]);
        if (!usuario) return error(res, 'Usuario no encontrado', 404);

        await pool.execute('DELETE FROM favoritos WHERE usuario_id = ?', [id]);
        await pool.execute('DELETE FROM historial_busquedas WHERE usuario_id = ?', [id]);
        await pool.execute('DELETE FROM usuario_generos WHERE usuario_id = ?', [id]);
        await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        await registrarAccion(req.usuario.id, 'eliminar', 'usuario', id, `Usuario eliminado: ${usuario.nombre_usuario}`);

        return success(res, { mensaje: `Usuario ${usuario.nombre_usuario} eliminado correctamente` });
    } catch (err) {
        console.error('Error eliminando usuario:', err.message, err.sql);
        return error(res, 'Error al eliminar usuario: ' + err.message, 500);
    }
},

    // GET /api/admin/peliculas
    async listarPeliculas(req, res) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.id, p.tmdb_id, p.titulo, p.anio, p.director, p.sinopsis,
                        p.poster_url, p.backdrop_url, p.tipo_analisis, p.media_type,
                        a.estado as estado_analisis, a.id as analisis_id
                 FROM peliculas p
                 LEFT JOIN analisis a ON a.pelicula_id = p.id
                 ORDER BY p.id DESC`
            );
            return success(res, { peliculas: rows });
        } catch (err) {
            console.error('Error listando películas:', err.message);
            return error(res, 'Error al obtener películas', 500);
        }
    },

    // DELETE /api/admin/peliculas/:id
    async eliminarPelicula(req, res) {
        try {
            const { id } = req.params;

            const [[pelicula]] = await pool.execute('SELECT id, titulo FROM peliculas WHERE id = ?', [id]);
            if (!pelicula) return error(res, 'Película no encontrada', 404);

            await pool.execute(
                'DELETE FROM capas_analisis WHERE analisis_id IN (SELECT id FROM analisis WHERE pelicula_id = ?)', [id]
            );
            await pool.execute('DELETE FROM analisis WHERE pelicula_id = ?', [id]);
            await pool.execute('DELETE FROM favoritos WHERE pelicula_id = ?', [id]);
            await pool.execute('DELETE FROM peliculas WHERE id = ?', [id]);

            await registrarAccion(req.usuario.id, 'eliminar', 'pelicula', id, `Película eliminada: ${pelicula.titulo}`);

            return success(res, { mensaje: `Película "${pelicula.titulo}" eliminada correctamente` });
        } catch (err) {
            console.error('Error eliminando película:', err.message);
            return error(res, 'Error al eliminar película', 500);
        }
    },

    // DELETE /api/admin/analisis/:id
    async eliminarAnalisis(req, res) {
        try {
            const { id } = req.params;

            const [[analisis]] = await pool.execute(
                'SELECT a.id, p.titulo FROM analisis a JOIN peliculas p ON a.pelicula_id = p.id WHERE a.id = ?', [id]
            );
            if (!analisis) return error(res, 'Análisis no encontrado', 404);

            await pool.execute('DELETE FROM capas_analisis WHERE analisis_id = ?', [id]);
            await pool.execute('DELETE FROM analisis WHERE id = ?', [id]);

            await registrarAccion(req.usuario.id, 'eliminar', 'analisis', id, `Análisis eliminado: ${analisis.titulo}`);

            return success(res, { mensaje: 'Análisis eliminado. Se regenerará al próximo acceso.' });
        } catch (err) {
            console.error('Error eliminando análisis:', err.message);
            return error(res, 'Error al eliminar análisis', 500);
        }
    },

    // PUT /api/admin/usuarios/:id
    async editarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { nombre_usuario, nombre_completo, nivel_cinefilo, rol } = req.body;

            if (parseInt(id) === req.usuario.id && rol !== 'admin') {
                return error(res, 'No puedes cambiar tu propio rol', 400);
            }

            await pool.execute(
                `UPDATE usuarios SET nombre_usuario = ?, nombre_completo = ?, nivel_cinefilo = ?, rol = ? WHERE id = ?`,
                [nombre_usuario, nombre_completo || null, nivel_cinefilo || null, rol, id]
            );

            await registrarAccion(req.usuario.id, 'modificar', 'usuario', id, `Editado: ${nombre_usuario}`);
            return success(res, { mensaje: 'Usuario actualizado correctamente' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return error(res, 'El nombre de usuario ya está en uso', 400);
            console.error('Error editando usuario:', err.message);
            return error(res, 'Error al editar usuario', 500);
        }
    },

    // PUT /api/admin/usuarios/:id/generos
    async editarGenerosUsuario(req, res) {
        try {
            const { id } = req.params;
            const { generos } = req.body;

            if (!generos || generos.length < 1 || generos.length > 7) {
                return error(res, 'Debes seleccionar entre 1 y 7 géneros', 400);
            }

            await pool.execute('DELETE FROM usuario_generos WHERE usuario_id = ?', [id]);
            for (const g of generos) {
                await pool.execute(
                    'INSERT IGNORE INTO usuario_generos (usuario_id, genero_id, genero_nombre) VALUES (?, ?, ?)',
                    [id, g.id, g.nombre]
                );
            }

            await registrarAccion(req.usuario.id, 'modificar', 'usuario_generos', id, 'Géneros actualizados por admin');
            return success(res, { mensaje: 'Géneros actualizados correctamente' });
        } catch (err) {
            console.error('Error editando géneros usuario:', err.message);
            return error(res, 'Error al editar géneros', 500);
        }
    },

    // PUT /api/admin/peliculas/:id
    async editarPelicula(req, res) {
        try {
            const { id } = req.params;
            const { titulo, sinopsis, director, anio, poster_url, backdrop_url, tipo_analisis } = req.body;

            if (!titulo) return error(res, 'El título es obligatorio', 400);

            await pool.execute(
                `UPDATE peliculas SET titulo = ?, sinopsis = ?, director = ?, anio = ?,
                 poster_url = ?, backdrop_url = ?, tipo_analisis = ? WHERE id = ?`,
                [titulo, sinopsis || null, director || null, anio || null,
                 poster_url || null, backdrop_url || null, tipo_analisis, id]
            );

            await registrarAccion(req.usuario.id, 'modificar', 'pelicula', id, `Editada: ${titulo}`);
            return success(res, { mensaje: 'Película actualizada correctamente' });
        } catch (err) {
            console.error('Error editando película:', err.message);
            return error(res, 'Error al editar película', 500);
        }
    },

    // GET /api/admin/peliculas/:id/analisis
    async obtenerCapasAnalisis(req, res) {
        try {
            const { id } = req.params;

            const [[analisis]] = await pool.execute(
                'SELECT id, tipo, estado FROM analisis WHERE pelicula_id = ? AND eliminado = FALSE', [id]
            );
            if (!analisis) return error(res, 'No hay análisis para esta película', 404);

            const [capas] = await pool.execute(
                'SELECT id, nombre_capa, contenido, orden FROM capas_analisis WHERE analisis_id = ? ORDER BY orden',
                [analisis.id]
            );

            return success(res, { analisis_id: analisis.id, tipo: analisis.tipo, estado: analisis.estado, capas });
        } catch (err) {
            console.error('Error obteniendo capas:', err.message);
            return error(res, 'Error al obtener análisis', 500);
        }
    },

    // PUT /api/admin/capas/:id
    async editarCapa(req, res) {
        try {
            const { id } = req.params;
            const { contenido } = req.body;

            if (!contenido || contenido.trim().length === 0) {
                return error(res, 'El contenido no puede estar vacío', 400);
            }

            await pool.execute('UPDATE capas_analisis SET contenido = ? WHERE id = ?', [contenido.trim(), id]);

            await registrarAccion(req.usuario.id, 'modificar', 'capa_analisis', id, 'Capa editada manualmente');
            return success(res, { mensaje: 'Capa guardada correctamente' });
        } catch (err) {
            console.error('Error editando capa:', err.message);
            return error(res, 'Error al editar capa', 500);
        }
    },

    // GET /api/admin/historial
    async historial(req, res) {
        try {
            const [rows] = await pool.execute(
                `SELECT h.id, h.accion, h.entidad, h.entidad_id, h.detalle, h.realizado_en, u.nombre_usuario
                 FROM historial_admin h
                 JOIN usuarios u ON h.admin_id = u.id
                 ORDER BY h.realizado_en DESC
                 LIMIT 50`
            );
            return success(res, { historial: rows });
        } catch (err) {
            console.error('Error obteniendo historial:', err.message);
            return error(res, 'Error al obtener historial', 500);
        }
    }
};

// Helper interno
async function registrarAccion(admin_id, accion, entidad, entidad_id, detalle) {
    try {
        await pool.execute(
            'INSERT INTO historial_admin (admin_id, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
            [admin_id, accion, entidad, entidad_id, detalle]
        );
    } catch (err) {
        console.error('Error registrando acción admin:', err.message);
    }
}

module.exports = adminController;