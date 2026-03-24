const API_URL = 'https://magic-film-api.onrender.com/api';

function getToken() { return localStorage.getItem('mf_token'); }

// ── TABS ──────────────────────────────────────
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// ── OBTENER tmdb_id DE LA URL ─────────────────
function getTmdbId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tmdb_id');
}

// ── YOUTUBE ───────────────────────────────────
async function cargarYouTube(pelicula, tipo, containerId) {
  try {
    const res = await fetch(
      `${API_URL}/peliculas/youtube/${pelicula.tmdb_id}?tipo=${tipo}&titulo=${encodeURIComponent(pelicula.titulo)}`
    );
    const data = await res.json();

    if (!data.ok || data.data.videos.length === 0) {
      document.getElementById(containerId).innerHTML = '';
      return;
    }

    const videos = data.data.videos;

    document.getElementById(containerId).innerHTML = `
      <div style="margin:2rem 0;">
        <h3 style="color:#f5a623;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;">
          <i class="fab fa-youtube" style="color:#ff0000;"></i>
          ${tipo === 'profundo' ? 'Análisis y explicaciones' : 'Curiosidades y behind the scenes'}
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
          ${videos.map(v => `
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;overflow:hidden;
                        border:1px solid rgba(255,255,255,0.08);transition:transform 0.3s;"
                 onmouseover="this.style.transform='translateY(-4px)'"
                 onmouseout="this.style.transform='translateY(0)'">
              <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                <iframe
                  src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy">
                </iframe>
              </div>
              <div style="padding:1rem;">
                <p style="color:#fff;font-size:0.85rem;font-weight:600;margin:0 0 0.3rem;
                           line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;
                           -webkit-box-orient:vertical;overflow:hidden;">
                  ${v.titulo}
                </p>
                <p style="color:#888;font-size:0.75rem;margin:0;">
                  <i class="fas fa-user" style="margin-right:0.3rem;"></i>${v.canal}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error cargando YouTube:', err);
  }
}

// ── MOSTRAR PELÍCULA ENTRETENIMIENTO ──────────
function mostrarPeliculaEntretenimiento(pelicula, capas) {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('movie-detail-entertainment').style.display = 'block';

  document.getElementById('ent-hero-img').src    = pelicula.poster_url || '';
  document.getElementById('ent-poster-img').src  = pelicula.poster_url || '';
  document.getElementById('ent-title').textContent    = pelicula.titulo;
  document.getElementById('ent-synopsis').textContent = pelicula.sinopsis || '';
  document.getElementById('ent-year').textContent     = pelicula.anio || '';
  document.getElementById('ent-genre').textContent    = pelicula.director || '';
  document.getElementById('ent-duration').textContent = pelicula.duracion_min ? `${pelicula.duracion_min} min` : '';
  document.getElementById('ent-rating').textContent   = pelicula.calificacion
    ? parseFloat(pelicula.calificacion).toFixed(1) : '-';

  if (capas) {
    capas.forEach(capa => {
      try {
        const data = JSON.parse(capa.contenido);

        if (capa.nombre_capa === 'resumen') {
          document.getElementById('ent-resumen-content').innerHTML = `
            <p style="font-size:1.05rem;font-weight:600;color:#f5a623;margin-bottom:1.5rem;line-height:1.6;">
              ${data.intro}
            </p>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(data.puntos || []).map(p => `
                <div style="display:flex;gap:0.75rem;align-items:flex-start;
                            padding:1rem;background:rgba(255,255,255,0.03);
                            border-radius:8px;border-left:3px solid #f5a623;">
                  <i class="fas fa-check-circle" style="color:#f5a623;margin-top:3px;flex-shrink:0;"></i>
                  <span><strong style="color:#fff;">${p.titulo}</strong> ${p.texto}</span>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'momentos') {
          const colorMap = {
            red: '#e74c3c', yellow: '#f1c40f',
            cyan: '#00bcd4', purple: '#9c27b0', green: '#2ecc71'
          };
          document.getElementById('ent-momentos-content').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1.5rem;">
              ${(Array.isArray(data) ? data : []).map(t => `
                <div style="display:flex;gap:1rem;align-items:flex-start;">
                  <div style="width:4px;min-height:80px;background:${colorMap[t.color]||'#f5a623'};
                              border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
                  <div style="flex:1;padding:1rem;background:rgba(255,255,255,0.03);border-radius:8px;">
                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                      <span style="font-family:monospace;font-size:0.8rem;color:#888;">${t.tiempo}</span>
                      <span style="padding:0.2rem 0.6rem;border-radius:4px;font-size:0.7rem;
                                   font-weight:700;background:${colorMap[t.color]||'#f5a623'}22;
                                   color:${colorMap[t.color]||'#f5a623'};">${t.tag}</span>
                    </div>
                    <h4 style="color:#fff;margin:0 0 0.5rem;font-size:1rem;">${t.titulo || t.title || 'Momento clave'}</h4>
                    <p style="color:#aaa;margin:0;font-size:0.9rem;line-height:1.6;">${t.texto}</p>
                  </div>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'easter_eggs') {
          document.getElementById('ent-easter_eggs-content').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(Array.isArray(data) ? data : []).map(e => `
                <div style="display:flex;gap:1rem;align-items:flex-start;
                            padding:1rem;background:rgba(255,255,255,0.03);border-radius:8px;">
                  <div style="width:40px;height:40px;background:rgba(245,166,35,0.15);
                              border-radius:50%;display:flex;align-items:center;
                              justify-content:center;flex-shrink:0;">
                    <i class="fas fa-egg" style="color:#f5a623;"></i>
                  </div>
                  <div>
                    <h4 style="color:#fff;margin:0 0 0.4rem;font-size:0.95rem;">${e.titulo}</h4>
                    <p style="color:#aaa;margin:0;font-size:0.88rem;line-height:1.6;">${e.texto}</p>
                  </div>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'curiosidades') {
          document.getElementById('ent-curiosidades-content').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">
              ${(Array.isArray(data) ? data : []).map(c => `
                <div style="padding:1.5rem;background:rgba(255,255,255,0.04);
                            border-radius:12px;border:1px solid rgba(255,255,255,0.07);
                            text-align:center;">
                  <i class="${c.icono}" style="font-size:1.8rem;color:#f5a623;margin-bottom:0.75rem;display:block;"></i>
                  <h4 style="color:#fff;margin:0 0 0.5rem;font-size:0.95rem;">${c.titulo}</h4>
                  <p style="color:#aaa;margin:0;font-size:0.85rem;line-height:1.5;">${c.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

      } catch(e) {
        // Si el contenido no es JSON, mostrarlo como texto plano
        const el = document.getElementById(`ent-${capa.nombre_capa}-content`);
        if (el) el.textContent = capa.contenido;
      }
    });
  }

  cargarYouTube(pelicula, 'entretenimiento', 'ent-youtube-section');

  const btnGuardar = document.getElementById('btn-guardar-ent');
  if (btnGuardar) btnGuardar.onclick = () => guardarFavorito(pelicula.id);
}

function mostrarPeliculaProfunda(pelicula, capas) {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('movie-detail-profound').style.display = 'block';

  document.getElementById('prof-hero-img').src    = pelicula.poster_url || '';
  document.getElementById('prof-poster-img').src  = pelicula.poster_url || '';
  document.getElementById('prof-title').textContent    = pelicula.titulo;
  document.getElementById('prof-synopsis').textContent = pelicula.sinopsis || '';
  document.getElementById('prof-year').textContent     = pelicula.anio || '';
  document.getElementById('prof-genre').textContent    = pelicula.director || '';
  document.getElementById('prof-duration').textContent = pelicula.duracion_min ? `${pelicula.duracion_min} min` : '';
  document.getElementById('prof-rating').textContent   = pelicula.calificacion
    ? parseFloat(pelicula.calificacion).toFixed(1) : '-';

  if (capas) {
    capas.forEach(capa => {
      try {
        const data = JSON.parse(capa.contenido);

        if (capa.nombre_capa === 'narrativa') {
          document.getElementById('prof-narrativa-content').innerHTML = `
            <p style="font-size:1.05rem;font-style:italic;color:#f5a623;
                      margin-bottom:2rem;line-height:1.7;border-left:3px solid #f5a623;
                      padding-left:1rem;">
              ${data.intro}
            </p>
            ${(data.secciones || []).map(s => `
              <div style="margin-bottom:2rem;padding:1.5rem;background:rgba(255,255,255,0.03);
                          border-radius:12px;">
                <h4 style="color:#fff;font-size:1.05rem;margin:0 0 0.75rem;">${s.titulo}</h4>
                <p style="color:#bbb;line-height:1.8;margin:0 0 ${s.cita ? '1rem' : '0'};">${s.texto}</p>
                ${s.cita ? `
                  <div style="margin-top:1rem;padding:1rem 1.5rem;background:rgba(245,166,35,0.08);
                              border-left:3px solid #f5a623;border-radius:0 8px 8px 0;">
                    <i class="fas fa-quote-left" style="color:#f5a623;margin-bottom:0.5rem;display:block;"></i>
                    <blockquote style="color:#ddd;font-style:italic;margin:0 0 0.5rem;line-height:1.6;">
                      "${s.cita.texto}"
                    </blockquote>
                    <cite style="color:#888;font-size:0.8rem;">— ${s.cita.fuente}</cite>
                  </div>
                ` : ''}
              </div>
            `).join('')}`;
        }
        

        if (capa.nombre_capa === 'simbolismo') {
          document.getElementById('prof-simbolismo-content').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
              ${(Array.isArray(data) ? data : []).map(s => `
                <div style="padding:1.5rem;background:rgba(255,255,255,0.04);
                            border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                  <div style="width:48px;height:48px;background:rgba(245,166,35,0.15);
                              border-radius:12px;display:flex;align-items:center;
                              justify-content:center;margin-bottom:1rem;">
                    <i class="${s.icono}" style="font-size:1.3rem;color:#f5a623;"></i>
                  </div>
                  <h4 style="color:#fff;margin:0 0 0.5rem;font-size:0.95rem;">${s.titulo}</h4>
                  <p style="color:#aaa;margin:0;font-size:0.88rem;line-height:1.6;">${s.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'contexto') {
          document.getElementById('prof-contexto-content').innerHTML = `
            <p style="color:#aaa;margin-bottom:1.5rem;line-height:1.7;">${data.intro || ''}</p>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(data.items || []).map(c => `
                <div style="padding:1.5rem;background:rgba(255,255,255,0.03);
                            border-radius:12px;border-left:3px solid rgba(245,166,35,0.4);">
                  <h4 style="color:#f5a623;margin:0 0 0.5rem;display:flex;align-items:center;gap:0.5rem;">
                    <i class="${c.icono}"></i> ${c.titulo}
                  </h4>
                  <p style="color:#aaa;margin:0;line-height:1.7;">${c.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'tecnica') {
          document.getElementById('prof-tecnica-content').innerHTML = `
            <p style="color:#aaa;margin-bottom:1.5rem;line-height:1.7;font-style:italic;">
              ${data.intro || ''}
            </p>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(data.aspectos || []).map(a => `
                <div style="padding:1.5rem;background:rgba(255,255,255,0.03);border-radius:12px;">
                  <h4 style="color:#fff;margin:0 0 0.5rem;font-size:0.95rem;">
                    <span style="color:#f5a623;">▸</span> ${a.titulo}
                  </h4>
                  <p style="color:#aaa;margin:0;line-height:1.7;">${a.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'conclusion') {
          const texto = typeof data === 'string' ? data : JSON.stringify(data);
          document.getElementById('prof-conclusion-content').innerHTML = `
            <div style="padding:2rem;background:rgba(245,166,35,0.05);
                        border-radius:12px;border:1px solid rgba(245,166,35,0.2);">
              <p style="color:#ddd;line-height:1.9;font-size:1rem;margin:0;">${texto}</p>
            </div>`;
        }

        if (capa.nombre_capa === 'momentos') {
  const colorMap = {
    red: '#e74c3c', yellow: '#f1c40f',
    cyan: '#00bcd4', purple: '#9c27b0', green: '#2ecc71'
  };
  document.getElementById('prof-momentos-content').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      ${(Array.isArray(data) ? data : []).map(t => `
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <div style="width:4px;min-height:80px;background:${colorMap[t.color]||'#f5a623'};
                      border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
          <div style="flex:1;padding:1rem;background:rgba(255,255,255,0.03);border-radius:8px;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
              <span style="font-family:monospace;font-size:0.8rem;color:#888;">${t.tiempo}</span>
              <span style="padding:0.2rem 0.6rem;border-radius:4px;font-size:0.7rem;
                           font-weight:700;background:${colorMap[t.color]||'#f5a623'}22;
                           color:${colorMap[t.color]||'#f5a623'};">${t.tag}</span>
            </div>
            <h4 style="color:#fff;margin:0 0 0.5rem;font-size:1rem;">${t.titulo || 'Momento clave'}</h4>
            <p style="color:#aaa;margin:0;font-size:0.9rem;line-height:1.6;">${t.texto}</p>
          </div>
        </div>
      `).join('')}
    </div>`;
}

      } catch(e) {
        const el = document.getElementById(`prof-${capa.nombre_capa}-content`);
        if (el) el.textContent = capa.contenido;
      }
    });
  }

  cargarYouTube(pelicula, 'profundo', 'prof-youtube-section');

  const btnGuardar = document.getElementById('btn-guardar-prof');
  if (btnGuardar) btnGuardar.onclick = () => guardarFavorito(pelicula.id);
}

// ── GUARDAR FAVORITO ──────────────────────────
async function guardarFavorito(pelicula_id) {
  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const res = await fetch(`${API_URL}/usuarios/favoritos/${pelicula_id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (data.ok) {
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Película agregada a favoritos',
        background: '#1a1a1a',
        color: '#ffffff',
        iconColor: '#f5a623',
        confirmButtonColor: '#f5a623',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } else if (data.error && data.error.includes('ya está')) {
      Swal.fire({
        icon: 'warning',
        title: 'Aviso',
        text: 'Esta película ya está en tus favoritos',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#f5a623'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.error || 'Error al guardar',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#f5a623'
      });
    }
  } catch (err) {
    console.error('Error guardando favorito:', err);
  }
}

// ── CARGAR ANÁLISIS ───────────────────────────
async function cargarAnalisis(tmdb_id) {
  try {
    const resPelicula = await fetch(`${API_URL}/peliculas/${tmdb_id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const dataPelicula = await resPelicula.json();

    if (!dataPelicula.ok) {
      document.getElementById('loading-screen').innerHTML =
        '<p style="color:#e74c3c;">Error al cargar la película</p>';
      return;
    }

    const pelicula = dataPelicula.data.pelicula;

    const resAnalisis = await fetch(`${API_URL}/analisis/${pelicula.id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const dataAnalisis = await resAnalisis.json();

    let capas = null;

    if (dataAnalisis.ok && dataAnalisis.data.analisis.estado === 'completo') {
      capas = dataAnalisis.data.analisis.capas;
    } else {
      if (!getToken()) {
        document.getElementById('loading-screen').innerHTML = `
          <div style="text-align:center;">
            <i class="fas fa-lock" style="font-size:3rem;color:#f5a623;margin-bottom:1rem;"></i>
            <p style="color:#a0a0a0;margin-bottom:1rem;">Inicia sesión para generar el análisis</p>
            <a href="login.html" class="btn btn-primary">Iniciar sesión</a>
          </div>
        `;
        return;
      }

      const resGenerar = await fetch(`${API_URL}/analisis/generar/${pelicula.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const dataGenerar = await resGenerar.json();

      if (dataGenerar.ok) {
        capas = dataGenerar.data.analisis.capas;
      } else {
        document.getElementById('loading-screen').innerHTML =
          '<p style="color:#e74c3c;">Error al generar el análisis. Intenta de nuevo.</p>';
        return;
      }
    }

    if (pelicula.tipo_analisis === 'profundo') {
      mostrarPeliculaProfunda(pelicula, capas);
    } else {
      mostrarPeliculaEntretenimiento(pelicula, capas);
    }

  } catch (err) {
    console.error('Error:', err);
    document.getElementById('loading-screen').innerHTML =
      '<p style="color:#e74c3c;">Error de conexión con el servidor</p>';
  }
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tmdb_id = getTmdbId();
  if (!tmdb_id) {
    window.location.href = 'busqueda.html';
    return;
  }
  cargarAnalisis(tmdb_id);
});