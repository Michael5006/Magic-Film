const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { success, error } = require('../utils/responseHelper');
const env = require('../config/env');

const authController = {

  // POST /api/auth/registro
  async registro(req, res) {
    try {
      const { nombre_usuario, email, password, nombre_completo } = req.body;

      // Validaciones básicas
      if (!nombre_usuario || !email || !password) {
        return error(res, 'nombre_usuario, email y password son obligatorios', 400);
      }

      if (password.length < 6) {
        return error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      // Verificar que el email no exista
      const emailExiste = await Usuario.buscarPorEmail(email);
      if (emailExiste) {
        return error(res, 'El email ya está registrado', 409);
      }

      // Verificar que el username no exista
      const usernameExiste = await Usuario.buscarPorUsername(nombre_usuario);
      if (usernameExiste) {
        return error(res, 'El nombre de usuario ya está en uso', 409);
      }

      // Encriptar contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario
      const id = await Usuario.crear({
        nombre_usuario,
        email,
        password_hash,
        nombre_completo: nombre_completo || nombre_usuario
      });

      // Generar token JWT
      const token = jwt.sign(
        { id, email, rol: 'registrado' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return success(res, {
        mensaje: 'Usuario registrado correctamente',
        token,
        usuario: { id, nombre_usuario, email, rol: 'registrado' }
      }, 201);

    } catch (err) {
      console.error('Error en registro:', err.message);
      return error(res, 'Error al registrar usuario', 500);
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return error(res, 'Email y password son obligatorios', 400);
      }

      // Buscar usuario
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return error(res, 'Credenciales incorrectas', 401);
      }

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValida) {
        return error(res, 'Credenciales incorrectas', 401);
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return success(res, {
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre_usuario: usuario.nombre_usuario,
          email: usuario.email,
          rol: usuario.rol,
          onboarding_completo: usuario.onboarding_completo
        }
      });

    } catch (err) {
      console.error('Error en login:', err.message);
      return error(res, 'Error al iniciar sesión', 500);
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      if (!usuario) {
        return error(res, 'Usuario no encontrado', 404);
      }
      return success(res, { usuario });
    } catch (err) {
      console.error('Error en me:', err.message);
      return error(res, 'Error al obtener usuario', 500);
    }
  }

};

module.exports = authController;