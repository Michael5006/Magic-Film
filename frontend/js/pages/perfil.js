const API_URL = '/api';

function getToken() { return localStorage.getItem('mf_token'); }
function getUsuario() {
  const u = localStorage.getItem('mf_usuario');
  return u ? JSON.parse(u) : null;
}

if (!getToken()) window.location.href = 'login.html';

// ── INICIALES AVATAR ──────────────────────────────
function generarAvatarIniciales(nombre) {
    const palabras = (nombre || '').trim().split(/\s+/);
    let iniciales;
    if (palabras.length >= 2) {
        iniciales = (palabras[0][0] + palabras[1][0]).toUpperCase();
    } else {
        const palabra = palabras[0] || 'U';
        const camel = palabra.match(/^([A-Za-z]).*?([A-Z])/);
        iniciales = camel ? (camel[1] + camel[2]).toUpperCase() : palabra.slice(0, 2).toUpperCase();
    }

    const canvas = document.createElement('canvas');
    canvas.width  = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 70);
    grad.addColorStop(0, '#2a2a2a');
    grad.addColorStop(1, '#111111');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 64, 62, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f5a623';
    ctx.font = 'bold 46px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iniciales, 64, 66);

    return canvas.toDataURL('image/png');
}

// ── CARGAR PERFIL ─────────────────────────────
async function cargarPerfil() {
  try {
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
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
    document.getElementById('profile-nombre').textContent   = usuario.nombre_completo || '';

    const nivel = usuario.nivel_cinefilo || 'explorador';
    document.getElementById('profile-nivel').textContent =
      nivel.charAt(0).toUpperCase() + nivel.slice(1);

    if (usuario.bio) {
      document.getElementById('profile-bio').textContent = usuario.bio;
    }

  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

// ── EDITAR PERFIL ─────────────────────────────
async function editarPerfil() {
  // Leer valores actuales del DOM
  const usernameActual     = document.getElementById('profile-username').textContent.trim();
  const nombreActual       = document.getElementById('profile-nombre').textContent.trim();
  const bioActual          = document.getElementById('profile-bio').textContent.trim();

  const { isConfirmed, value } = await Swal.fire({
    title: '<span style="color:#fff;font-size:1.1rem;">Editar perfil</span>',
    html: `
      <div style="text-align:left; display:flex; flex-direction:column; gap:1rem;">
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">Nombre completo</label>
          <input id="swal-nombre" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;"
                 placeholder="Tu nombre completo" value="${nombreActual}">
        </div>
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">Nombre de usuario</label>
          <input id="swal-username" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;"
                 placeholder="Sin espacios, ej: cinefilo99" value="${usernameActual}">
          <small style="color:#555;font-size:0.75rem;">Solo letras, números y guión bajo</small>
        </div>
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">
            Bio <span style="color:#555;">(opcional)</span>
            <span id="swal-bio-count" style="float:right;color:#555;">${bioActual.length}/300</span>
          </label>
          <textarea id="swal-bio" class="swal2-textarea" style="margin:0;width:100%;box-sizing:border-box;resize:vertical;"
                    placeholder='"El cine es mi escape favorito..."' maxlength="300"
                    rows="3">${bioActual}</textarea>
        </div>
        <p id="swal-error" style="color:#e74c3c;font-size:0.82rem;min-height:1rem;margin:0;"></p>
      </div>
    `,
    background: '#1a1a1a',
    color: '#fff',
    confirmButtonColor: '#f5a623',
    cancelButtonColor: '#333',
    showCancelButton: true,
    confirmButtonText: 'Guardar cambios',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      document.getElementById('swal-bio').addEventListener('input', (e) => {
        document.getElementById('swal-bio-count').textContent = `${e.target.value.length}/300`;
      });
    },
    preConfirm: () => {
      const nombre_usuario  = document.getElementById('swal-username').value.trim();
      const nombre_completo = document.getElementById('swal-nombre').value.trim();
      const bio             = document.getElementById('swal-bio').value.trim();
      const errEl           = document.getElementById('swal-error');

      if (!nombre_completo) { errEl.textContent = 'El nombre completo es obligatorio'; return false; }
      if (!nombre_usuario)  { errEl.textContent = 'El nombre de usuario es obligatorio'; return false; }
      if (nombre_usuario.length < 3) { errEl.textContent = 'El usuario debe tener al menos 3 caracteres'; return false; }
      if (!/^[a-zA-Z0-9_]+$/.test(nombre_usuario)) {
        errEl.textContent = 'Solo letras, números y guión bajo';
        return false;
      }
      if (bio.length > 300) { errEl.textContent = 'La bio no puede superar 300 caracteres'; return false; }

      return { nombre_usuario, nombre_completo, bio };
    }
  });

  if (!isConfirmed || !value) return;

  try {
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(value)
    });
    const data = await res.json();

    if (data.ok) {
      document.getElementById('profile-username').textContent = value.nombre_usuario;
      document.getElementById('profile-nombre').textContent   = value.nombre_completo;
      document.getElementById('profile-bio').textContent      = value.bio;

      // Actualizar caché local para que el navbar refleje el cambio
      const usuario = getUsuario();
      if (usuario) {
        usuario.nombre_usuario = value.nombre_usuario;
        localStorage.setItem('mf_usuario', JSON.stringify(usuario));
      }

      Swal.fire({
        icon: 'success', title: '¡Perfil actualizado!',
        timer: 1400, showConfirmButton: false,
        background: '#1a1a1a', color: '#fff', iconColor: '#f5a623'
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error,
        background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error de conexión',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
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

      // Guardar en la base de datos
      try {
        const res = await fetch(`${API_URL}/usuarios/foto`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ foto_perfil: fotoComprimida })
        });
        const data = await res.json();
        if (data.ok) {
          // Actualizar caché local también
          const usuario = getUsuario();
          if (usuario) localStorage.setItem(`foto_${usuario.id}`, fotoComprimida);
          Swal.fire({
            icon: 'success',
            title: '¡Foto actualizada!',
            timer: 1200,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#fff',
            iconColor: '#f5a623'
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Error al guardar foto', timer: 1500, showConfirmButton: false });
        }
      } catch (err) {
        console.error('Error guardando foto:', err);
        Swal.fire({ icon: 'error', title: 'Error de conexión', timer: 1500, showConfirmButton: false });
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
};

// ── GÉNEROS DISPONIBLES ───────────────────────
const GENEROS_DISPONIBLES = [
    { id: 28,    nombre: 'Acción' },
    { id: 18,    nombre: 'Drama' },
    { id: 35,    nombre: 'Comedia' },
    { id: 27,    nombre: 'Terror' },
    { id: 878,   nombre: 'Ciencia Ficción' },
    { id: 53,    nombre: 'Thriller' },
    { id: 10749, nombre: 'Romance' },
];

// ── CARGAR GÉNEROS ────────────────────────────
async function cargarGeneros() {
  try {
    const res = await fetch(`${API_URL}/usuarios/generos`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const generos = data.ok ? data.data.generos : [];

    const container = document.querySelector('.profile-sections');
    const existente = document.getElementById('seccion-generos');
    if (existente) existente.remove();

    const seccion = document.createElement('div');
    seccion.className = 'profile-section';
    seccion.id = 'seccion-generos';
    seccion.innerHTML = `
      <h3 class="genres-header">
        <span><i class="fas fa-heart"></i> Mis Géneros Favoritos</span>
        <button class="btn-edit-generos" onclick="editarGeneros()">
          <i class="fas fa-pencil-alt"></i> Editar
        </button>
      </h3>
      <div class="favorite-genres" style="margin-top:0.75rem;">
        ${generos.length > 0
          ? generos.map(g => `<span class="fav-genre">${g.nombre}</span>`).join('')
          : '<span style="color:#666;font-size:0.85rem;">Aún no has elegido géneros.</span>'
        }
      </div>
    `;
    container.insertBefore(seccion, container.firstChild);
  } catch (err) {
    console.error('Error cargando géneros:', err);
  }
}

// ── EDITAR GÉNEROS ────────────────────────────
async function editarGeneros() {
  // Leer géneros actuales del DOM
  const actuales = [...document.querySelectorAll('#seccion-generos .fav-genre')]
      .map(el => el.textContent.trim());

  const chipsHTML = GENEROS_DISPONIBLES.map(g => {
    const activo = actuales.includes(g.nombre) ? 'active' : '';
    return `<span class="edit-genre-chip ${activo}" data-id="${g.id}" data-nombre="${g.nombre}">${g.nombre}</span>`;
  }).join('');

  const { isConfirmed, value } = await Swal.fire({
    title: '<span style="color:#fff;font-size:1.1rem;">Mis Géneros Favoritos</span>',
    html: `
      <p style="color:#888;font-size:0.82rem;margin-bottom:1.1rem;">Selecciona exactamente 3 géneros</p>
      <div id="genre-chips-wrap" style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;">
        ${chipsHTML}
      </div>
      <p id="genre-edit-error" style="color:#e74c3c;font-size:0.8rem;min-height:1.2rem;margin-top:0.75rem;"></p>
    `,
    background: '#1a1a1a',
    color: '#fff',
    confirmButtonColor: '#f5a623',
    confirmButtonText: 'Guardar cambios',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    didOpen: () => {
      document.querySelectorAll('.edit-genre-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const errEl = document.getElementById('genre-edit-error');
          if (chip.classList.contains('active')) {
            chip.classList.remove('active');
          } else {
            const activos = document.querySelectorAll('.edit-genre-chip.active').length;
            if (activos >= 3) {
              errEl.textContent = 'Solo puedes elegir 3 géneros';
              return;
            }
            chip.classList.add('active');
          }
          document.getElementById('genre-edit-error').textContent = '';
        });
      });
    },
    preConfirm: () => {
      const activos = [...document.querySelectorAll('.edit-genre-chip.active')];
      if (activos.length !== 3) {
        document.getElementById('genre-edit-error').textContent = 'Debes seleccionar exactamente 3 géneros';
        return false;
      }
      return activos.map(c => ({ id: parseInt(c.dataset.id), nombre: c.dataset.nombre }));
    }
  });

  if (!isConfirmed || !value) return;

  try {
    const res = await fetch(`${API_URL}/usuarios/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ generos: value })
    });
    const data = await res.json();

    if (data.ok) {
      Swal.fire({
        icon: 'success', title: '¡Géneros actualizados!',
        background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623',
        timer: 1500, showConfirmButton: false
      });
      cargarGeneros();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error,
        background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error de conexión',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
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
        <p style="color:#666; padding:0.5rem 0;">No tienes películas guardadas aún.
          <a href="busqueda.html" style="color:#f5a623;">Explorar películas</a>
        </p>`;
      document.getElementById('stat-favoritos').textContent = '0';
      return;
    }

    document.getElementById('stat-favoritos').textContent = data.data.favoritos.length;

    container.innerHTML = data.data.favoritos.map(p => {
      const poster  = p.poster_url || '../assets/images/Profile.jpg';
      const esProfundo = p.tipo_analisis === 'profundo';
      const mediaParam = p.media_type ? `&media_type=${p.media_type}` : '';
      return `
        <div class="saved-movie" onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}${mediaParam}'">
          <img class="saved-movie-poster" src="${poster}" alt="${p.titulo}" loading="lazy">
          <button class="saved-delete-btn"
            aria-label="Eliminar"
            onclick="event.stopPropagation(); eliminarFavorito(${p.id})">
            <i class="fas fa-trash"></i>
          </button>
          <div class="saved-info">
            <span class="saved-title">${p.titulo}</span>
            <span class="saved-meta">${p.anio || ''}${p.anio && p.media_type === 'tv' ? ' · Serie' : ''}</span>
            <span class="saved-type ${esProfundo ? 'profundo' : 'entertainment'}">
              ${esProfundo ? 'Profundo' : 'Entretenimiento'}
            </span>
          </div>
        </div>`;
    }).join('');

    // ── Carrusel: flechas ─────────────────────────
    iniciarCarrusel(container);

  } catch (err) {
    console.error('Error cargando favoritos:', err);
  }
}

function iniciarCarrusel(track) {
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  if (!btnPrev || !btnNext) return;

  const SCROLL_PX = 450; // px por clic de flecha

  function actualizarFlechas() {
    const { scrollLeft, scrollWidth, clientWidth } = track;
    btnPrev.classList.toggle('hidden', scrollLeft <= 4);
    btnNext.classList.toggle('hidden', scrollLeft + clientWidth >= scrollWidth - 4);
  }

  btnPrev.addEventListener('click', () => {
    track.scrollBy({ left: -SCROLL_PX, behavior: 'smooth' });
  });
  btnNext.addEventListener('click', () => {
    track.scrollBy({ left: SCROLL_PX, behavior: 'smooth' });
  });

  track.addEventListener('scroll', actualizarFlechas, { passive: true });

  // Estado inicial (esperar un tick para que el DOM calcule anchos)
  requestAnimationFrame(actualizarFlechas);
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

        // Mostrar solo los últimos 5, el resto con scroll
        const historial = data.data.historial.slice(0, 20);
        const visibles  = historial.slice(0, 5);
        const ocultos   = historial.slice(5);

        document.getElementById('stat-busquedas').textContent = data.data.historial.length;
        document.getElementById('section-historial').style.display = 'block';

        const container = document.getElementById('search-history');
        container.style.maxHeight = '260px';
        container.style.overflowY = 'auto';

        const renderItem = h => `
            <div class="history-item"
                 onclick="${h.tmdb_id
                    ? `window.location.href='analisis.html?tmdb_id=${h.tmdb_id}'`
                    : `window.location.href='busqueda.html?q=${encodeURIComponent(h.termino_buscado)}'`}"
                 style="cursor:pointer;">
                <i class="fas ${h.tmdb_id ? 'fa-film' : 'fa-search'}" 
                   style="color:${h.tmdb_id ? '#f5a623' : '#666'}"></i>
                <span>${h.termino_buscado}</span>
                <span class="history-date">${formatearFecha(h.buscado_en)}</span>
            </div>
        `;

        container.innerHTML = visibles.map(renderItem).join('');

        

        // Botón ver más si hay más de 5
        if (ocultos.length > 0) {
            const btnVerMas = document.createElement('button');
            btnVerMas.className = 'btn btn-secondary';
            btnVerMas.style.cssText = 'width:100%; margin-top:0.75rem; font-size:0.8rem; padding:0.4rem;';
            btnVerMas.innerHTML = `<i class="fas fa-chevron-down"></i> Ver ${ocultos.length} más`;
            btnVerMas.onclick = () => {
                container.innerHTML += ocultos.map(renderItem).join('');
                btnVerMas.remove();
            };
            container.parentElement.appendChild(btnVerMas);
        }
        

    } catch (err) {
        console.error('Error cargando historial:', err);
    }
}

async function limpiarHistorial() {
    const confirm = await Swal.fire({
        title: '¿Limpiar historial?',
        text: 'Se eliminarán todas tus búsquedas anteriores.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#333',
        background: '#1a1a1a',
        color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/usuarios/historial`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.ok) {
            document.getElementById('section-historial').style.display = 'none';
            document.getElementById('stat-busquedas').textContent = '0';
            Swal.fire({ icon:'success', title:'Historial limpiado',
                background:'#1a1a1a', color:'#fff', confirmButtonColor:'#f5a623',
                timer:1500, showConfirmButton:false });
        }
    } catch (err) {
        console.error('Error limpiando historial:', err);
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

// Aplicar foto: primero caché local (respuesta inmediata), luego sincronizar desde BD
const usuarioGuardado = getUsuario();
if (usuarioGuardado) {
  let fotoCache = localStorage.getItem(`foto_${usuarioGuardado.id}`);
  if (fotoCache) {
    document.getElementById('profile-avatar').src = fotoCache;
    document.getElementById('nav-avatar-img').src = fotoCache;
  }

  // Sincronizar foto desde la base de datos
  fetch(`${API_URL}/usuarios/perfil`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
    .then(r => r.json())
    .then(data => {
      if (!data.ok) return;
      const u = data.data.usuario;
      const fotoDB = u.foto_perfil;
      if (fotoDB) {
        localStorage.setItem(`foto_${u.id}`, fotoDB);
        document.getElementById('profile-avatar').src = fotoDB;
        document.getElementById('nav-avatar-img').src = fotoDB;
      } else if (!fotoCache) {
        const iniciales = generarAvatarIniciales(u.nombre_completo || u.nombre_usuario);
        document.getElementById('profile-avatar').src = iniciales;
        document.getElementById('nav-avatar-img').src = iniciales;
      }
    })
    .catch(() => {
      if (!fotoCache) {
        const iniciales = generarAvatarIniciales(usuarioGuardado.nombre_completo || usuarioGuardado.nombre_usuario);
        document.getElementById('profile-avatar').src = iniciales;
        document.getElementById('nav-avatar-img').src = iniciales;
      }
    });
}

// ── CERRAR SESIÓN ─────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('mf_token');
  localStorage.removeItem('mf_usuario');
  window.location.href = 'index.html';
});

// ── CAMBIAR CONTRASEÑA ────────────────────────
document.getElementById('btn-cambiar-password').addEventListener('click', async () => {
  const { value, isConfirmed } = await Swal.fire({
    title: '<span style="color:#fff;font-size:1.1rem;">Cambiar contraseña</span>',
    html: `
      <div style="text-align:left; display:flex; flex-direction:column; gap:1rem;">
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">Contraseña actual</label>
          <input id="swal-pwd-actual" type="password" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;" placeholder="Tu contraseña actual">
        </div>
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">Nueva contraseña</label>
          <input id="swal-pwd-nueva" type="password" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;" placeholder="Mínimo 6 caracteres">
        </div>
        <div>
          <label style="color:#888;font-size:0.8rem;display:block;margin-bottom:0.4rem;">Confirmar nueva contraseña</label>
          <input id="swal-pwd-confirm" type="password" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;" placeholder="Repite la nueva contraseña">
        </div>
        <p id="swal-pwd-error" style="color:#e74c3c;font-size:0.82rem;min-height:1rem;margin:0;"></p>
      </div>
    `,
    background: '#1a1a1a', color: '#fff',
    confirmButtonColor: '#f5a623', cancelButtonColor: '#333',
    showCancelButton: true,
    confirmButtonText: 'Cambiar', cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const actual   = document.getElementById('swal-pwd-actual').value;
      const nueva    = document.getElementById('swal-pwd-nueva').value;
      const confirm  = document.getElementById('swal-pwd-confirm').value;
      const errEl    = document.getElementById('swal-pwd-error');
      if (!actual)              { errEl.textContent = 'Ingresa tu contraseña actual'; return false; }
      if (nueva.length < 6)    { errEl.textContent = 'La nueva contraseña debe tener al menos 6 caracteres'; return false; }
      if (nueva !== confirm)   { errEl.textContent = 'Las contraseñas no coinciden'; return false; }
      return { password_actual: actual, password_nueva: nueva };
    }
  });

  if (!isConfirmed || !value) return;

  try {
    const res  = await fetch(`${API_URL}/usuarios/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(value)
    });
    const data = await res.json();
    if (data.ok) {
      Swal.fire({ icon: 'success', title: '¡Contraseña actualizada!',
        timer: 1500, showConfirmButton: false,
        background: '#1a1a1a', color: '#fff', iconColor: '#2ecc71' });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error,
        background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error de conexión',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
  }
});

// ── ELIMINAR CUENTA ───────────────────────────
document.getElementById('btn-eliminar-cuenta').addEventListener('click', async () => {
  // Paso 1: advertencia
  const { isConfirmed: confirmado } = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar tu cuenta?',
    html: 'Esta acción es <strong>irreversible</strong>. Se eliminarán tus favoritos, historial y datos de perfil.',
    background: '#1a1a1a', color: '#fff',
    confirmButtonColor: '#e74c3c', cancelButtonColor: '#333',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
  });
  if (!confirmado) return;

  // Paso 2: confirmar con contraseña (si tiene)
  const usuario = getUsuario();
  const { value, isConfirmed } = await Swal.fire({
    title: '<span style="color:#fff;font-size:1rem;">Confirma con tu contraseña</span>',
    html: `
      <p style="color:#888;font-size:0.85rem;margin-bottom:1rem;">Escribe tu contraseña para confirmar que eres tú.</p>
      <input id="swal-del-pwd" type="password" class="swal2-input"
             style="margin:0;width:100%;box-sizing:border-box;" placeholder="Tu contraseña">
      <p id="swal-del-error" style="color:#e74c3c;font-size:0.82rem;min-height:1rem;margin-top:0.5rem;"></p>
    `,
    background: '#1a1a1a', color: '#fff',
    confirmButtonColor: '#e74c3c', cancelButtonColor: '#333',
    showCancelButton: true,
    confirmButtonText: 'Eliminar definitivamente', cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const pwd = document.getElementById('swal-del-pwd').value;
      if (!pwd) { document.getElementById('swal-del-error').textContent = 'Ingresa tu contraseña'; return false; }
      return pwd;
    }
  });

  if (!isConfirmed || !value) return;

  try {
    const res  = await fetch(`${API_URL}/usuarios/cuenta`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ password: value })
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.clear();
      await Swal.fire({ icon: 'success', title: 'Cuenta eliminada',
        text: 'Tu cuenta ha sido eliminada. ¡Hasta pronto!',
        timer: 2000, showConfirmButton: false,
        background: '#1a1a1a', color: '#fff', iconColor: '#f5a623' });
      window.location.href = 'index.html';
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error,
        background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error de conexión',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
  }
});

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarPerfil();
  cargarFavoritos();
  cargarGeneros();
  cargarHistorial();
});