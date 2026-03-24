const API_URL = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('mf_token'); }

let searchTimeout = null;

// ── BUSCAR PELÍCULA ───────────────────────────
function handleSearch(event) {
  const q = document.getElementById('searchInput').value.trim();

  clearTimeout(searchTimeout);

  if (q.length < 2) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('recommendations').style.display = 'block';
    return;
  }

  searchTimeout = setTimeout(() => buscar(q), 500);
}

async function buscar(q) {
  try {
    const res = await fetch(`${API_URL}/peliculas/buscar?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (data.ok) {
      mostrarResultados(data.data.peliculas);
    }
  } catch (err) {
    console.error('Error buscando:', err);
  }
}

function mostrarResultados(peliculas) {
  const grid = document.getElementById('resultsGrid');
  const section = document.getElementById('searchResults');
  const recommendations = document.getElementById('recommendations');

  if (peliculas.length === 0) {
    grid.innerHTML = '<p style="color:#666; padding:1rem; text-align:center;">No se encontraron películas</p>';
  } else {
    grid.innerHTML = peliculas.map(p => `
    <div class="movie-item" onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}'">
    <div class="movie-poster">
        <img src="${p.poster_url || 'https://i.ibb.co/TxjhW06S/Cartel-vintage-de-pel-cula-perdida.png'}" alt="${p.titulo}">
    </div>
    <span class="movie-name">${p.titulo}</span>
    <span class="movie-year">${p.anio || ''}</span>
</div>
    `).join('');
  }

  section.style.display = 'block';
  recommendations.style.display = 'none';
}

function quickSearch(termino) {
  document.getElementById('searchInput').value = termino;
  buscar(termino);
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Actualizar navbar si no hay sesión
    const usuario = localStorage.getItem('mf_usuario');
    if (!usuario) {
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.85rem;">
                    Iniciar sesión
                </a>
            `;
        }
    }

    // Cargar recomendados dinámicos
    try {
        const res = await fetch('http://localhost:3000/api/peliculas/populares');
        const data = await res.json();
        if (!data.ok) return;

        const grid = document.getElementById('movie-grid');
        if (!grid) return;

        grid.innerHTML = data.data.peliculas.map(p => `
    <div class="movie-item" onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}'" style="cursor:pointer; text-align:center;">
        <div class="movie-poster">
            <img src="${p.poster_url || ''}" alt="${p.titulo}" style="width:100%; border-radius:8px;">
        </div>
        <span class="movie-name" style="display:block; text-align:center; margin-top:0.5rem; font-size:0.85rem; font-weight:600;">${p.titulo}</span>
        <span class="movie-year" style="display:block; text-align:center; font-size:0.75rem; color:#888;">${p.anio || ''}</span>
    </div>
`).join('');
    } catch (err) {
        console.error('Error cargando recomendados:', err);
    }

// IDs reales de géneros en TMDB
const TMDB_GENEROS = {
  'Acción': 28,
  'Ciencia Ficción': 878,
  'Comedia': 35,
  'Terror': 27,
  'Drama': 18,
  'Romance': 10749,
  'Animación': 16,
  'Thriller': 53
};

window.quickSearchPorId = async function(genero_id, nombre) {
  document.getElementById('searchInput').value = nombre;
  document.getElementById('recommendations').style.display = 'none';

  try {
    const res = await fetch(`http://localhost:3000/api/peliculas/genero/${genero_id}`);
    const data = await res.json();
    if (data.ok) mostrarResultados(data.data.peliculas);
  } catch (err) {
    console.error('Error buscando por género:', err);
  }
};

window.quickSearch = function(termino) {
  document.getElementById('searchInput').value = termino;
  buscar(termino);
};

});