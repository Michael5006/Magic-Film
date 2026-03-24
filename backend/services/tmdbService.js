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
  }

};

module.exports = tmdbService;