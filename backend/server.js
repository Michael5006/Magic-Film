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

const app = express();

// ── Middlewares globales ────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ───────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/analisis',  analisisRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/admin',     adminRoutes);

// ── Ruta de salud ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Magic Film API funcionando',
    version: '1.0.0'
  });
});

// ── Ruta no encontrada ──────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
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