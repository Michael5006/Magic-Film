const API_URL = 'https://magic-film-api.onrender.com/api';

function getToken() { return localStorage.getItem('mf_token'); }
function getUsuario() {
  const u = localStorage.getItem('mf_usuario');
  return u ? JSON.parse(u) : null;
}

if (!getToken()) window.location.href = 'login.html';

// ── CARGAR PERFIL ─────────────────────────────
async function cargarPerfil() {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!data.ok) {
      localStorage.removeItem('mf_token');
      localStorage.removeItem('mf_usuario');
      window.location.href = 'login.html';
      return;
    }

    const usuario = data.data.usuario;
    document.getElementById('profile-username').textContent = usuario.nombre_usuario;

    const nivel = usuario.nivel_cinefilo || 'explorador';
    document.getElementById('profile-nivel').textContent =
      nivel.charAt(0).toUpperCase() + nivel.slice(1);

  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

// ── EDITAR PERFIL ─────────────────────────────
async function editarPerfil() {
  const usuario = getUsuario();
  const bioActual = localStorage.getItem(`bio_${usuario?.id}`) || '';

  const { value: bio } = await Swal.fire({
    title: 'Editar perfil',
    input: 'textarea',
    inputLabel: 'Tu descripción',
    inputValue: bioActual,
    inputPlaceholder: '"El cine es mi escape favorito..."',
    inputAttributes: { maxlength: 150, rows: 3 },
    background: '#1a1a1a',
    color: '#ffffff',
    confirmButtonColor: '#f5a623',
    cancelButtonColor: '#333',
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (value.length > 150) return 'Máximo 150 caracteres';
    }
  });

  if (bio !== undefined) {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem(`bio_${data.data.usuario.id}`, bio);
      document.getElementById('profile-bio').textContent = bio;
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        timer: 1200,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#f5a623'
      });
    }
  }
}

// ── CAMBIAR FOTO ──────────────────────────────
window.cambiarFoto = function() {
  document.getElementById('input-foto').click();
};

window.previewFoto = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      // Redimensionar a máximo 200x200
      const canvas = document.createElement('canvas');
      const max = 200;
      let w = img.width;
      let h = img.height;
      if (w > h) { h = (h / w) * max; w = max; }
      else { w = (w / h) * max; h = max; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      // Comprimir a JPEG calidad 0.7
      const fotoComprimida = canvas.toDataURL('image/jpeg', 0.7);

      document.getElementById('profile-avatar').src = fotoComprimida;
      document.getElementById('nav-avatar-img').src = fotoComprimida;

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(`foto_${data.data.usuario.id}`, fotoComprimida);
        Swal.fire({
          icon: 'success',
          title: '¡Foto actualizada!',
          timer: 1200,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#fff',
          iconColor: '#f5a623'
        });
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
};

// ── CARGAR GÉNEROS ────────────────────────────
async function cargarGeneros() {
  try {
    const res = await fetch(`${API_URL}/usuarios/generos`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!data.ok || data.data.generos.length === 0) return;

    const container = document.querySelector('.profile-sections');
    const seccion = document.createElement('div');
    seccion.className = 'profile-section';
    seccion.innerHTML = `
      <h3><i class="fas fa-heart"></i> Mis Géneros Favoritos</h3>
      <div class="favorite-genres">
        ${data.data.generos.map(g => `<span class="fav-genre">${g.nombre}</span>`).join('')}
      </div>
    `;
    container.insertBefore(seccion, container.firstChild);
  } catch (err) {
    console.error('Error cargando géneros:', err);
  }
}

// ── CARGAR FAVORITOS ──────────────────────────
async function cargarFavoritos() {
  try {
    const res = await fetch(`${API_URL}/usuarios/favoritos`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const container = document.getElementById('saved-movies');

    if (!data.ok || data.data.favoritos.length === 0) {
      container.innerHTML = `
        <p style="color:#666;">No tienes películas guardadas aún.
          <a href="busqueda.html" style="color:#f5a623;">Explorar películas</a>
        </p>`;
      document.getElementById('stat-favoritos').textContent = '0';
      return;
    }

    document.getElementById('stat-favoritos').textContent = data.data.favoritos.length;

    container.innerHTML = data.data.favoritos.map(p => `
      <div class="saved-movie" onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}'">
        <img src="${p.poster_url || '../assets/images/Midsommar.jpg'}" alt="${p.titulo}">
        <div class="saved-info">
          <span class="saved-title">${p.titulo}</span>
          <span class="saved-meta">${p.anio || ''} • ${p.tipo_analisis === 'profundo' ? 'Folk Horror' : ''}</span>
          <span class="saved-type ${p.tipo_analisis === 'profundo' ? 'profundo' : 'entertainment'}">
            ${p.tipo_analisis === 'profundo' ? 'Profundo' : 'Entretenimiento'}
          </span>
        </div>
        <button class="btn btn-secondary"
          style="margin-left:auto;padding:0.3rem 0.7rem;font-size:0.75rem;"
          onclick="event.stopPropagation(); eliminarFavorito(${p.id}, this)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando favoritos:', err);
  }
}

// ── ELIMINAR FAVORITO ─────────────────────────
async function eliminarFavorito(pelicula_id) {
  const confirm = await Swal.fire({
    title: '¿Eliminar de favoritos?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#333',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1a1a1a',
    color: '#fff'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/usuarios/favoritos/${pelicula_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.ok) cargarFavoritos();
  } catch (err) {
    console.error('Error eliminando favorito:', err);
  }
}

// ── CARGAR HISTORIAL ──────────────────────────
async function cargarHistorial() {
  try {
    const res = await fetch(`${API_URL}/usuarios/historial`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!data.ok || data.data.historial.length === 0) return;

    document.getElementById('stat-busquedas').textContent = data.data.historial.length;
    document.getElementById('section-historial').style.display = 'block';

    document.getElementById('search-history').innerHTML = data.data.historial.map(h => `
  <div class="history-item" 
       onclick="${h.tmdb_id ? `window.location.href='analisis.html?tmdb_id=${h.tmdb_id}'` : `window.location.href='busqueda.html?q=${encodeURIComponent(h.termino_buscado)}'`}"
       style="cursor:pointer;">
    <i class="fas fa-search"></i>
    <span>${h.termino_buscado}</span>
    <span class="history-date">${formatearFecha(h.buscado_en)}</span>
  </div>
`).join('');
  } catch (err) {
    console.error('Error cargando historial:', err);
  }
}

function formatearFecha(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  const horas = Math.floor(mins / 60);
  const dias = Math.floor(horas / 24);
  if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
}

// Aplicar foto guardada INMEDIATAMENTE al cargar
const usuarioGuardado = getUsuario();
if (usuarioGuardado) {
  const fotoGuardada = localStorage.getItem(`foto_${usuarioGuardado.id}`);
  if (fotoGuardada) {
    document.getElementById('profile-avatar').src = fotoGuardada;
    document.getElementById('nav-avatar-img').src = fotoGuardada;
  }
  const bioGuardada = localStorage.getItem(`bio_${usuarioGuardado.id}`);
  if (bioGuardada) {
    document.getElementById('profile-bio').textContent = bioGuardada;
  }
}

// ── CERRAR SESIÓN ─────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('mf_token');
  localStorage.removeItem('mf_usuario');
  window.location.href = 'index.html';
});

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarPerfil();
  cargarFavoritos();
  cargarGeneros();
  cargarHistorial();
});