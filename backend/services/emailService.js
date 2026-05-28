const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

// Estilos base compartidos para los templates
const estilosBase = `
  font-family: 'Inter', Arial, sans-serif;
  background-color: #0a0a0a;
  color: #ffffff;
`;

function plantillaBase(contenido) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0; padding:0; background-color:#0a0a0a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111111; border-radius:12px; border:1px solid #222; overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%); padding:32px 40px; border-bottom:2px solid #f5a623; text-align:center;">
                <h1 style="margin:0; font-size:28px; color:#f5a623; letter-spacing:2px; font-weight:700;">MAGIC FILM</h1>
                <p style="margin:6px 0 0; color:#666; font-size:13px; letter-spacing:1px;">TU UNIVERSO CINEMATOGRÁFICO</p>
              </td>
            </tr>
            <!-- Contenido -->
            <tr>
              <td style="padding:40px;">
                ${contenido}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color:#0d0d0d; padding:20px 40px; text-align:center; border-top:1px solid #1e1e1e;">
                <p style="margin:0; color:#444; font-size:12px;">© 2026 Magic Film · Este correo fue enviado automáticamente, no respondas a este mensaje.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

const emailService = {

  async enviarVerificacion(email, nombre, token) {
    const url = `${env.APP_URL}/pages/verificar-email.html?token=${token}`;

    const contenido = `
      <h2 style="margin:0 0 8px; color:#ffffff; font-size:22px;">Verifica tu correo</h2>
      <p style="margin:0 0 24px; color:#888; font-size:14px;">Hola <strong style="color:#f5a623;">${nombre}</strong>, ya casi estás listo.</p>

      <p style="color:#ccc; font-size:15px; line-height:1.6; margin:0 0 32px;">
        Para activar tu cuenta en Magic Film y acceder a todos los análisis cinematográficos, necesitamos verificar tu correo electrónico.
      </p>

      <div style="text-align:center; margin:0 0 32px;">
        <a href="${url}"
           style="display:inline-block; background-color:#f5a623; color:#000000; text-decoration:none;
                  font-weight:700; font-size:15px; padding:14px 36px; border-radius:6px; letter-spacing:0.5px;">
          Verificar mi correo
        </a>
      </div>

      <p style="color:#555; font-size:12px; text-align:center; margin:0;">
        Este enlace expira en <strong style="color:#888;">24 horas</strong>.<br>
        Si no creaste una cuenta, puedes ignorar este correo.
      </p>
    `;

    await transporter.sendMail({
      from: `"Magic Film" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu correo - Magic Film',
      html: plantillaBase(contenido)
    });
  },

  async enviarCodigoVerificacion(email, codigo) {
    const contenido = `
      <h2 style="margin:0 0 8px; color:#ffffff; font-size:22px;">Confirma tu correo</h2>
      <p style="margin:0 0 28px; color:#888; font-size:14px;">Usa este código para completar tu registro en Magic Film.</p>

      <div style="text-align:center; margin:0 0 28px;">
        <div style="display:inline-block; background-color:#1a1a1a; border:2px solid #f5a623;
                    border-radius:12px; padding:20px 40px;">
          <span style="font-size:38px; font-weight:700; color:#f5a623; letter-spacing:10px;">${codigo}</span>
        </div>
      </div>

      <p style="color:#555; font-size:12px; text-align:center; margin:0;">
        Este código expira en <strong style="color:#888;">10 minutos</strong>.<br>
        Si no intentaste registrarte en Magic Film, ignora este correo.
      </p>
    `;

    await transporter.sendMail({
      from: `"Magic Film" <${env.EMAIL_USER}>`,
      to: email,
      subject: `${codigo} es tu código de Magic Film`,
      html: plantillaBase(contenido)
    });
  },

  async enviarContacto(nombre, emailRemitente, asunto, mensaje) {
    const contenido = `
      <h2 style="margin:0 0 8px; color:#ffffff; font-size:22px;">Nuevo mensaje de contacto</h2>
      <p style="margin:0 0 24px; color:#888; font-size:14px;">Recibido desde el formulario de la web.</p>

      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0; color:#888; font-size:13px; border-bottom:1px solid #222; width:100px;">Nombre</td>
          <td style="padding:10px 0; color:#fff; font-size:14px; border-bottom:1px solid #222;"><strong>${nombre}</strong></td>
        </tr>
        <tr>
          <td style="padding:10px 0; color:#888; font-size:13px; border-bottom:1px solid #222;">Email</td>
          <td style="padding:10px 0; color:#f5a623; font-size:14px; border-bottom:1px solid #222;">${emailRemitente}</td>
        </tr>
        <tr>
          <td style="padding:10px 0; color:#888; font-size:13px; border-bottom:1px solid #222;">Asunto</td>
          <td style="padding:10px 0; color:#fff; font-size:14px; border-bottom:1px solid #222;">${asunto}</td>
        </tr>
      </table>

      <div style="background:#1a1a1a; border:1px solid #333; border-radius:8px; padding:20px; margin-bottom:16px;">
        <p style="color:#ccc; font-size:14px; line-height:1.7; margin:0; white-space:pre-wrap;">${mensaje}</p>
      </div>

      <p style="color:#555; font-size:12px; text-align:center; margin:0;">
        Puedes responder directamente a <strong style="color:#888;">${emailRemitente}</strong>
      </p>
    `;

    await transporter.sendMail({
      from: `"Magic Film Contacto" <${env.EMAIL_USER}>`,
      to: 'magicfilm001@gmail.com',
      replyTo: emailRemitente,
      subject: `[Contacto] ${asunto}`,
      html: plantillaBase(contenido)
    });
  },

  async enviarResetPassword(email, nombre, token) {
    const url = `${env.APP_URL}/pages/reset-password.html?token=${token}`;

    const contenido = `
      <h2 style="margin:0 0 8px; color:#ffffff; font-size:22px;">Restablecer contraseña</h2>
      <p style="margin:0 0 24px; color:#888; font-size:14px;">Hola <strong style="color:#f5a623;">${nombre}</strong>.</p>

      <p style="color:#ccc; font-size:15px; line-height:1.6; margin:0 0 32px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña.
      </p>

      <div style="text-align:center; margin:0 0 32px;">
        <a href="${url}"
           style="display:inline-block; background-color:#f5a623; color:#000000; text-decoration:none;
                  font-weight:700; font-size:15px; padding:14px 36px; border-radius:6px; letter-spacing:0.5px;">
          Restablecer contraseña
        </a>
      </div>

      <p style="color:#555; font-size:12px; text-align:center; margin:0;">
        Este enlace expira en <strong style="color:#888;">1 hora</strong>.<br>
        Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
      </p>
    `;

    await transporter.sendMail({
      from: `"Magic Film" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecer contraseña - Magic Film',
      html: plantillaBase(contenido)
    });
  }

};

module.exports = emailService;
