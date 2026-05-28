const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { testConnection } = require('./config/db');

// ── Importar rutas ──────────────────────────
const authRoutes      = require('./routes/auth');
const peliculasRoutes = require('./routes/peliculas');
const analisisRoutes  = require('./routes/analisis');
const usuariosRoutes  = require('./routes/usuarios');
const adminRoutes     = require('./routes/admin');
const emailService    = require('./services/emailService');

const app = express();

// ── Middlewares globales ────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Servir frontend estático ────────────────
app.use(express.static('../frontend'));


// ── Rutas ───────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/analisis',  analisisRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/admin',     adminRoutes);

// ── Contacto ────────────────────────────────
app.post('/api/contacto', async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios' });
    }
    await emailService.enviarContacto(nombre, email, asunto, mensaje);
    res.json({ ok: true, data: { mensaje: 'Mensaje enviado correctamente' } });
  } catch (err) {
    console.error('Error enviando contacto:', err);
    res.status(500).json({ ok: false, error: 'Error al enviar el mensaje' });
  }
});

// ── Ruta raíz ───────────────────────────────
app.get('/', (req, res) => {
  res.sendFile('pages/index.html', { root: '../frontend' });
});

// ── Ruta de salud ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Magic Film API funcionando',
    version: '0.2'
  });
});

// ── Ruta no encontrada ──────────────────────
app.use((req, res) => {
  // Si es petición a la API, responder JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  // Todo lo demás → página 404
  res.status(404).sendFile('pages/404.html', { root: '../frontend' });
});

// ── Iniciar servidor ────────────────────────
async function iniciarServidor() {
  await testConnection();
  app.listen(env.PORT, () => {
    console.log(`🎬 Magic Film API corriendo en http://localhost:${env.PORT}`);
    console.log(`📌 Ambiente: ${env.NODE_ENV}`);
  });
}

iniciarServidor();