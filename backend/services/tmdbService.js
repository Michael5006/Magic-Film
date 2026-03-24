const env = require('../config/env');

const TMDB_BASE_URL = env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = env.TMDB_API_KEY;

const tmdbService = {

  // Buscar películas por título
  async buscarPelicula(titulo) {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(titulo)}&language=es-ES`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al consultar TMDB');
    
    const data = await response.json();
    return data.results || [];
  },

  // Obtener detalles completos de una película
  async obtenerDetalles(tmdb_id) {
    const url = `${TMDB_BASE_URL}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=keywords,credits`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener detalles de TMDB');
    
    const data = await response.json();

    // Extraer keywords
    const keywords = data.keywords?.keywords?.map(k => k.name) || [];

    // Extraer director
    const director = data.credits?.crew?.find(p => p.job === 'Director')?.name || 'Desconocido';

    return {
      tmdb_id: data.id,
      titulo: data.title,
      titulo_original: data.original_title,
      anio: data.release_date ? parseInt(data.release_date.split('-')[0]) : null,
      director,
      duracion_min: data.runtime || null,
      sinopsis: data.overview || '',
      calificacion: data.vote_average || null,
      poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      keywords,
      generos: data.genres?.map(g => g.name) || []
    };
  },

  async obtenerDatosCompletos(tmdb_id) {
  try {
    const apiKey = env.TMDB_API_KEY;
    const base = env.TMDB_BASE_URL;

    const [detalles, creditos, keywords, similar] = await Promise.all([
      fetch(`${base}/movie/${tmdb_id}?api_key=${apiKey}&language=es-ES`).then(r => r.json()),
      fetch(`${base}/movie/${tmdb_id}/credits?api_key=${apiKey}&language=es-ES`).then(r => r.json()),
      fetch(`${base}/movie/${tmdb_id}/keywords?api_key=${apiKey}`).then(r => r.json()),
      fetch(`${base}/movie/${tmdb_id}/similar?api_key=${apiKey}&language=es-ES`).then(r => r.json())
    ]);

    // Reparto principal (top 5)
    const reparto = (creditos.cast || []).slice(0, 5).map(a => `${a.name} como ${a.character}`).join(', ');

    // Equipo técnico
    const crew = creditos.crew || [];
    const dp = crew.find(c => c.job === 'Director of Photography')?.name || null;
    const compositor = crew.find(c => c.job === 'Original Music Composer')?.name || null;
    const guionista = crew.find(c => c.department === 'Writing')?.name || null;

    // Keywords
    const kw = (keywords.keywords || []).map(k => k.name).join(', ');

    // Películas similares
    const similares = (similar.results || []).slice(0, 4).map(p => p.title).join(', ');

    // Datos financieros
    const presupuesto = detalles.budget ? `$${(detalles.budget / 1000000).toFixed(1)}M` : null;
    const recaudacion = detalles.revenue ? `$${(detalles.revenue / 1000000).toFixed(1)}M` : null;

    return {
      reparto,
      dp,
      compositor,
      guionista,
      keywords: kw,
      similares,
      presupuesto,
      recaudacion,
      duracion: detalles.runtime ? `${detalles.runtime} min` : null,
      paises: (detalles.production_countries || []).map(p => p.name).join(', '),
      productoras: (detalles.production_companies || []).slice(0, 3).map(p => p.name).join(', ')
    };
  } catch (err) {
    console.error('Error obteniendo datos completos TMDB:', err.message);
    return {};
  }
}

};

module.exports = tmdbService;