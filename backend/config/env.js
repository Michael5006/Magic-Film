require('dotenv').config();

module.exports = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Base de datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 3307,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'magic_filmv01',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'magic_film_secret_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  

  // Email (Gmail)
  EMAIL_USER: process.env.EMAIL_USER || 'michael.cmh10@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'esgi hksg fenw lyfz',     

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '351739610821-c9cf1r2k07uv8bk8601gqqo53ai5jkbm.apps.googleusercontent.com',

  // URL pública de la app (para links en emails)
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // APIs externas
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
};