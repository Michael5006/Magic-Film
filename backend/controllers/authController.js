const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/Usuario');
const CodigoVerificacion = require('../models/CodigoVerificacion');
const emailService = require('../services/emailService');
const { success, error } = require('../utils/responseHelper');
const env = require('../config/env');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const authController = {

  // POST /api/auth/registro
  async registro(req, res) {
    try {
      const { nombre_usuario, email, password, nombre_completo, codigo } = req.body;

      // Validaciones básicas
      if (!nombre_usuario || !email || !password) {
        return error(res, 'nombre_usuario, email y password son obligatorios', 400);
      }
      if (password.length < 6) {
        return error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }
      if (!codigo) {
        return error(res, 'Debes verificar tu correo antes de registrarte', 400);
      }

      // Validar código de verificación
      const codigoValido = await CodigoVerificacion.verificar(email, codigo);
      if (!codigoValido) {
        return error(res, 'El código es incorrecto o ya expiró', 400);
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

      // Crear usuario (ya verificado por código)
      const id = await Usuario.crear({
        nombre_usuario,
        email,
        password_hash,
        nombre_completo: nombre_completo || nombre_usuario
      });

      // Marcar email como verificado y limpiar código
      await Usuario.verificarEmail(id);
      await CodigoVerificacion.eliminar(email);

      // Generar token JWT
      const token = jwt.sign(
        { id, email, rol: 'registrado' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return success(res, {
        mensaje: 'Usuario registrado correctamente.',
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
  },

  // POST /api/auth/enviar-codigo
  async enviarCodigo(req, res) {
    try {
      const { email } = req.body;
      if (!email) return error(res, 'El email es obligatorio', 400);

      // Verificar si ya está registrado
      const existe = await Usuario.buscarPorEmail(email);
      if (existe) {
        return error(res, 'Este correo ya está registrado. ¿Quieres iniciar sesión?', 409);
      }

      // Generar código de 6 dígitos
      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      const expira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Intentar enviar el email — si falla, propagar el error al usuario
      await emailService.enviarCodigoVerificacion(email, codigo);

      // Solo guardar en BD si el envío fue exitoso
      await CodigoVerificacion.guardar(email, codigo, expira);

      return success(res, { mensaje: 'Código enviado correctamente.' });

    } catch (err) {
      console.error('Error en enviarCodigo:', err.message);

      // Detectar errores conocidos de Nodemailer para dar mensajes útiles
      if (err.responseCode === 550 || err.message.includes('does not exist') || err.message.includes('No such user')) {
        return error(res, 'El correo ingresado no existe.', 400);
      }
      if (err.responseCode === 452 || err.message.includes('full') || err.message.includes('quota')) {
        return error(res, 'La bandeja del destinatario está llena. Usa otro correo.', 400);
      }
      if (err.message.includes('Invalid') || err.message.includes('invalid')) {
        return error(res, 'El correo ingresado no es válido.', 400);
      }

      return error(res, 'No se pudo enviar el código. Verifica que el correo sea válido.', 500);
    }
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return error(res, 'El email es obligatorio', 400);

      const usuario = await Usuario.buscarPorEmail(email);
      // Respuesta genérica para no revelar si el email existe
      if (!usuario) {
        console.log('[forgot-password] Email no encontrado en DB:', email);
        return success(res, { mensaje: 'Si el correo está registrado, recibirás un enlace en breve.' });
      }

      console.log('[forgot-password] Usuario encontrado:', usuario.email, '— enviando email...');

      const token = crypto.randomBytes(32).toString('hex');
      const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await Usuario.guardarResetToken(usuario.id, token, expira);
      await emailService.enviarResetPassword(usuario.email, usuario.nombre_usuario, token);

      console.log('[forgot-password] Email enviado correctamente a:', usuario.email);
      return success(res, { mensaje: 'Si el correo está registrado, recibirás un enlace en breve.' });

    } catch (err) {
      console.error('[forgot-password] ERROR:', err.message);
      return error(res, 'Error al procesar la solicitud', 500);
    }
  },

  // POST /api/auth/reset-password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!token || !password) return error(res, 'Token y contraseña son obligatorios', 400);
      if (password.length < 6) return error(res, 'La contraseña debe tener al menos 6 caracteres', 400);

      const usuario = await Usuario.buscarPorResetToken(token);
      if (!usuario) return error(res, 'El enlace es inválido o ha expirado', 400);

      const password_hash = await bcrypt.hash(password, 10);
      await Usuario.actualizarPassword(usuario.id, password_hash);

      return success(res, { mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (err) {
      console.error('Error en resetPassword:', err.message);
      return error(res, 'Error al restablecer la contraseña', 500);
    }
  },

  // GET /api/auth/verificar-email
  async verificarEmail(req, res) {
    try {
      const { token } = req.query;
      if (!token) return error(res, 'Token inválido', 400);

      const usuario = await Usuario.buscarPorTokenVerificacion(token);
      if (!usuario) return error(res, 'El enlace es inválido o ha expirado', 400);

      await Usuario.verificarEmail(usuario.id);
      return success(res, { mensaje: '¡Correo verificado correctamente! Ya puedes disfrutar Magic Film.' });

    } catch (err) {
      console.error('Error en verificarEmail:', err.message);
      return error(res, 'Error al verificar el correo', 500);
    }
  },

  // POST /api/auth/google
  async googleAuth(req, res) {
    try {
      const { id_token } = req.body;
      if (!id_token) return error(res, 'Token de Google requerido', 400);

      // Verificar el token con Google
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      const { sub: google_id, email, name, picture } = payload;

      // ¿Ya existe por google_id?
      let usuario = await Usuario.buscarPorGoogleId(google_id);

      if (!usuario) {
        // ¿Existe por email? → vincular
        usuario = await Usuario.buscarPorEmail(email);
        if (usuario) {
          await Usuario.vincularGoogle(usuario.id, google_id);
        } else {
          // Crear cuenta nueva
          const base = (name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
          let nombre_usuario = base.slice(0, 30);

          // Evitar username duplicado
          const existe = await Usuario.buscarPorUsername(nombre_usuario);
          if (existe) {
            nombre_usuario = `${nombre_usuario}${Math.floor(Math.random() * 9000) + 1000}`;
          }

          const id = await Usuario.crearConGoogle({
            nombre_usuario,
            email,
            nombre_completo: name || nombre_usuario,
            google_id
          });
          usuario = await Usuario.buscarPorId(id);
        }
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return success(res, {
        mensaje: 'Login con Google exitoso',
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
      console.error('Error en googleAuth:', err.message);
      return error(res, 'Error al autenticar con Google', 500);
    }
  }

};

module.exports = authController;