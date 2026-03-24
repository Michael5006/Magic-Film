require('dotenv').config();

module.exports = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Base de datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'magic_filmv01',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'magic_film_secret_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // APIs externas
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
};