const API_URL = '/api';

function getToken() {
  const token = localStorage.getItem('mf_token');
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}

// ── TABS ──────────────────────────────────────
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function getTmdbId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('tmdb_id');
}

// ← nuevo
function getMediaType() {
  const mt = new URLSearchParams(window.location.search).get('media_type');
  return mt === 'tv' ? 'tv' : 'movie';
}

// ← nuevo: badge visual para el header de análisis
function getBadgeAnalisis(media_type) {
    if (media_type !== 'tv') return '';
    return `<span style="
        padding:0.25rem 0.7rem;border-radius:20px;font-size:0.72rem;
        font-weight:700;letter-spacing:0.06em;
        background:var(--bg-input);color:var(--text-secondary);
        border:1px solid var(--border-color)">
        Serie
    </span>`;
}

// ← nuevo: texto de duración/info adaptado a película o serie
function getInfoDuracion(pelicula, media_type) {
    if (media_type === 'tv') {
        const partes = [];
        if (pelicula.temporadas) partes.push(`${pelicula.temporadas} temp.`);
        if (pelicula.episodios)  partes.push(`${pelicula.episodios} ep.`);
        return partes.length > 0 ? partes.join(' · ') : '';
    }
    return pelicula.duracion_min ? `${pelicula.duracion_min} min` : '';
}

// ── REPARTO ───────────────────────────────────
function renderizarReparto(reparto, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(reparto) || reparto.length === 0) return;

    container.innerHTML = `
        <div style="margin:2rem 0; text-align:center;">
            <h3 style="color:#f5a623; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                <i class="fas fa-users"></i> Reparto Principal
            </h3>
            <div style="display:flex; gap:1.5rem; flex-wrap:wrap; justify-content:center;">
                ${reparto.map(a => `
                    <div style="text-align:center; width:90px;">
                        <div style="width:72px; height:72px; border-radius:50%; overflow:hidden;
                                    border:2px solid rgba(245,166,35,0.3); margin:0 auto 0.5rem;
                                    background:var(--bg-card);">
                            ${a.foto
                                ? `<img src="${a.foto}" alt="${a.nombre}"
                                       style="width:100%;height:100%;object-fit:cover;"
                                       onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;\\'><i class=\\'fas fa-user\\' style=\\'color:var(--text-muted);font-size:1.5rem;\\'></i></div>'">`
                                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                                       <i class="fas fa-user" style="color:var(--text-muted);font-size:1.5rem;"></i>
                                   </div>`
                            }
                        </div>
                        <p style="color:var(--text-primary);font-size:0.75rem;font-weight:600;margin:0 0 0.2rem;line-height:1.3;">${a.nombre}</p>
                        <p style="color:var(--text-muted);font-size:0.68rem;margin:0;line-height:1.3;">${a.personaje}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ── SIMILARES (CARRUSEL) ──────────────────────
function scrollCarrusel(id, direccion) {
    const track = document.getElementById(id);
    if (track) track.scrollBy({ left: direccion * 400, behavior: 'smooth' });
}

function renderizarSimilares(similares, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(similares) || similares.length === 0) return;

    const id = `carrusel-${containerId}`;

    container.innerHTML = `
        <div style="margin:2rem 0;">
            <h3 style="color:#f5a623; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                <i class="fas fa-film"></i> También te puede gustar
            </h3>
            <div style="position:relative; padding:0 1rem;">
                <button onclick="scrollCarrusel('${id}', -1)"
                        style="position:absolute;left:0;top:50%;transform:translateY(-60%);
                               z-index:2;width:36px;height:36px;border-radius:50%;
                               background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);
                               color:#f5a623;cursor:pointer;font-size:1rem;
                               display:flex;align-items:center;justify-content:center;
                               transition:background 0.2s;"
                        onmouseover="this.style.background='rgba(245,166,35,0.3)'"
                        onmouseout="this.style.background='rgba(245,166,35,0.15)'">
                    <i class="fas fa-chevron-left"></i>
                </button>

                <div id="${id}"
                     style="display:flex;gap:1rem;overflow-x:auto;scroll-behavior:smooth;
                            padding:0.5rem 0.5rem;
                            scrollbar-width:none;-ms-overflow-style:none;">
                    ${similares.map(p => `
                        <div onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}'"
                             style="flex-shrink:0;width:120px;cursor:pointer;transition:transform 0.25s;"
                             onmouseover="this.style.transform='translateY(-6px)'"
                             onmouseout="this.style.transform='translateY(0)'">
                            <div style="border-radius:10px;overflow:hidden;
                                        border:1px solid var(--border-color);
                                        background:var(--bg-card);margin-bottom:0.5rem;aspect-ratio:2/3;">
                                <img src="${p.poster_url}" alt="${p.titulo}"
                                     style="width:100%;height:100%;object-fit:cover;"
                                     onerror="this.style.display='none'">
                            </div>
                            <p style="color:var(--text-primary);font-size:0.72rem;font-weight:600;
                                      margin:0 0 0.15rem;line-height:1.3;
                                      display:-webkit-box;-webkit-line-clamp:2;
                                      -webkit-box-orient:vertical;overflow:hidden;">${p.titulo}</p>
                            <p style="color:var(--text-muted);font-size:0.65rem;margin:0;">${p.anio || ''}</p>
                        </div>
                    `).join('')}
                </div>

                <button onclick="scrollCarrusel('${id}', 1)"
                        style="position:absolute;right:0;top:50%;transform:translateY(-60%);
                               z-index:2;width:36px;height:36px;border-radius:50%;
                               background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);
                               color:#f5a623;cursor:pointer;font-size:1rem;
                               display:flex;align-items:center;justify-content:center;
                               transition:background 0.2s;"
                        onmouseover="this.style.background='rgba(245,166,35,0.3)'"
                        onmouseout="this.style.background='rgba(245,166,35,0.15)'">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    // Ocultar scrollbar webkit
    const style = document.createElement('style');
    style.textContent = `#${id}::-webkit-scrollbar { display: none; }`;
    document.head.appendChild(style);
}

// ── YOUTUBE ───────────────────────────────────
async function cargarYouTube(pelicula, tipo, containerId) {
  try {
    const res = await fetch(
      `${API_URL}/peliculas/youtube/${pelicula.tmdb_id}?tipo=${tipo}&titulo=${encodeURIComponent(pelicula.titulo)}&media_type=${pelicula.media_type || 'movie'}`
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
          ${tipo === 'profundo' ? 'Análisis y explicaciones' : 'Curiosidades y detrás de cámaras'}
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
          ${videos.map(v => `
            <div style="background:var(--bg-card);border-radius:12px;overflow:hidden;
                        border:1px solid var(--border-color);transition:transform 0.3s;"
                 onmouseover="this.style.transform='translateY(-4px)'"
                 onmouseout="this.style.transform='translateY(0)'">
              <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                <iframe src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen loading="lazy"></iframe>
              </div>
              <div style="padding:1rem;">
                <p style="color:var(--text-primary);font-size:0.85rem;font-weight:600;margin:0 0 0.3rem;
                           line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;
                           -webkit-box-orient:vertical;overflow:hidden;">${v.titulo}</p>
                <p style="color:var(--text-muted);font-size:0.75rem;margin:0;">
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

// ── MODAL SINOPSIS + TRAILER ──────────────────
async function abrirModalSinopsis(pelicula, media_type) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-sinopsis';

    // Fetch del trailer
    let trailerHTML = `<p class="modal-no-trailer">Buscando trailer...</p>`;

    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <button class="modal-close" onclick="cerrarModalSinopsis()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="modal-poster">
                    <img src="${pelicula.poster_url || ''}" alt="${pelicula.titulo}">
                </div>
                <div class="modal-info">
                    <h2 class="modal-title">${pelicula.titulo}</h2>
                    <p class="modal-synopsis">${pelicula.sinopsis || ''}</p>
                </div>
            </div>
            <div class="modal-trailer">
                <h4><i class="fab fa-youtube" style="color:#ff0000;"></i> Trailer oficial</h4>
                <div id="modal-trailer-container">${trailerHTML}</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Cerrar al click fuera del box
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarModalSinopsis();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', _modalEscHandler);

    // Cargar trailer en paralelo
    try {
        const res  = await fetch(`${API_URL}/peliculas/${pelicula.tmdb_id}/trailer?media_type=${media_type}`);
        const data = await res.json();
        const container = document.getElementById('modal-trailer-container');
        if (!container) return;

        if (data.ok && data.data.trailer) {
    const key = data.data.trailer.youtube_key;
    container.innerHTML = `
        <div class="modal-trailer-frame">
            <iframe
                src="https://www.youtube.com/embed/${key}?autoplay=1&rel=0&modestbranding=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        </div>`;
} else {
    container.innerHTML = `<p class="modal-no-trailer">No encontramos trailer disponible.</p>`;
}
    } catch (err) {
        const container = document.getElementById('modal-trailer-container');
        if (container) container.innerHTML = `<p class="modal-no-trailer">No se pudo cargar el trailer.</p>`;
    }
}

function cerrarModalSinopsis() {
    const overlay = document.getElementById('modal-sinopsis');
    if (overlay) {
        // Detener el iframe antes de remover (evita que el audio siga)
        const iframe = overlay.querySelector('iframe');
        if (iframe) iframe.src = '';
        overlay.remove();
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', _modalEscHandler);
}

function _modalEscHandler(e) {
    if (e.key === 'Escape') cerrarModalSinopsis();
}

function iniciarSinopsisExpandible(peliculaRef, media_type, id) {
    const el = document.getElementById(id);
    if (!el) return;

    const toggle = document.createElement('span');
    toggle.style.cssText = `
        display: inline-block;
        color: #f5a623;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 1rem;
        user-select: none;
    `;
    toggle.textContent = '▼ Ver sinopsis completa';
    el.parentNode.insertBefore(toggle, el.nextSibling);

    toggle.addEventListener('click', () => abrirModalSinopsis(peliculaRef, media_type));
    el.addEventListener('click',     () => abrirModalSinopsis(peliculaRef, media_type));
}

// ── HELPERS ENTRETENIMIENTO ───────────────────
const EMOJI_REACCION = { red:'💥', yellow:'😂', cyan:'😮', purple:'😭', green:'✨' };
const DIFF_LABELS    = { facil:'OBVIO', oculto:'OCULTO', experto:'EXPERTO' };

function _eggDificultad(egg, idx) {
  if (egg.dificultad && DIFF_LABELS[egg.dificultad]) return egg.dificultad;
  const total = 3;
  if (idx < Math.ceil(total / 3))       return 'facil';
  if (idx < Math.ceil((2 * total) / 3)) return 'oculto';
  return 'experto';
}

function _renderScoreBars(scores) {
  if (!Array.isArray(scores) || scores.length === 0) return '';
  const bars = scores.map(s => `
    <div class="ent-score-row">
      <div class="ent-score-label"><i class="${s.icono}"></i>${s.aspecto}</div>
      <div class="ent-score-track">
        <div class="ent-score-fill" data-val="${s.valor}"
             style="width:0%;background:linear-gradient(90deg,#f5a623,#e8930a);"></div>
      </div>
      <div class="ent-score-num">${s.valor}</div>
    </div>`).join('');
  return `<div class="ent-score-grid">${bars}</div>`;
}

function _animarScoreBars() {
  document.querySelectorAll('.ent-score-fill[data-val]').forEach(el => {
    const val = el.dataset.val;
    requestAnimationFrame(() => setTimeout(() => { el.style.width = val + '%'; }, 80));
  });
}

const FANDOM_TIPO_COLOR = { teoria: '#9c27b0', meme: '#f1c40f', debate: '#e74c3c' };

function _renderFandom(data) {
  if (!data) return '<p style="color:var(--text-muted)">Sin datos de fandom.</p>';
  // Normalizar reacciones: acepta array o objeto {teoria:{...}, meme:{...}, debate:{...}}
  let reacciones = data.reacciones;
  if (!Array.isArray(reacciones)) {
    if (reacciones && typeof reacciones === 'object') {
      reacciones = Object.values(reacciones);
    } else {
      return '<p style="color:var(--text-muted)">Sin datos de fandom.</p>';
    }
  }
  data = { ...data, reacciones };

  const nivel = parseInt(data.nivel_culto) || 3;
  const estrellas = '★'.repeat(nivel) + '<span style="opacity:0.2">' + '★'.repeat(5 - nivel) + '</span>';

  const reaccionesHtml = data.reacciones.map(r => {
    const color = FANDOM_TIPO_COLOR[r.tipo] || '#f5a623';
    return `
    <div class="fandom-card">
      <div class="fandom-card-header">
        <span class="fandom-emoji">${r.emoji || '💬'}</span>
        <h4 class="fandom-titulo">${r.titulo}</h4>
        <span class="fandom-tipo-badge" style="background:${color}22;color:${color};">${r.tipo.toUpperCase()}</span>
      </div>
      <p class="fandom-texto">${r.texto}</p>
    </div>`;
  }).join('');

  const veredictoHtml = data.veredicto_fandom ? `
    <div class="fandom-veredicto">
      <span class="fandom-veredicto-label">El fandom dice:</span>
      <span class="fandom-veredicto-texto">"${data.veredicto_fandom}"</span>
    </div>` : '';

  return `
    <div class="fandom-culto-row">
      <span class="fandom-culto-label">Nivel de culto</span>
      <span class="fandom-culto-stars">${estrellas}</span>
    </div>
    <div class="fandom-reacciones">${reaccionesHtml}</div>
    ${veredictoHtml}`;
}

function _renderVeredicto(pelicula, capasMap) {
  const rating = parseFloat(pelicula.calificacion) || 7;
  let nivel, popcorns;
  if      (rating >= 8.5) { nivel = 'Obra Maestra del Entretenimiento'; popcorns = 5; }
  else if (rating >= 7.5) { nivel = 'Muy Recomendada';                  popcorns = 4; }
  else if (rating >= 6.5) { nivel = 'Buena Opción';                     popcorns = 3; }
  else if (rating >= 5.5) { nivel = 'Con Reservas';                     popcorns = 2; }
  else                    { nivel = 'Solo Para Fans';                    popcorns = 1; }

  const popcornHTML  = '🍿'.repeat(popcorns) + '<span style="opacity:0.25">' + '🍿'.repeat(5 - popcorns) + '</span>';
  const puntos       = capasMap.resumen?.puntos || [];
  const primerMomento = Array.isArray(capasMap.momentos) ? capasMap.momentos[0] : null;
  const numEggs      = Array.isArray(capasMap.easter_eggs) ? capasMap.easter_eggs.length : 0;
  const nivelCulto   = capasMap.fandom?.nivel_culto ?? null;
  const numCurio     = Array.isArray(capasMap.curiosidades) ? capasMap.curiosidades.length : 0;

  // Construir "¿Por qué vale la pena?" desde los puntos del resumen (sin repetir texto literal de otras tabs)
  const razonesHtml = puntos.length > 0 ? puntos.slice(0, 3).map(p => `
    <div class="veredicto-razon">
      <i class="fas fa-check" style="color:#f5a623;flex-shrink:0;margin-top:3px;"></i>
      <span><strong style="color:var(--text-primary);">${p.titulo}</strong> ${p.texto}</span>
    </div>`).join('') : '';

  return `
    <div class="veredicto-hero">
      <div class="veredicto-nivel">${nivel}</div>
      <div class="popcorn-row">${popcornHTML}</div>
      <div class="rating-label">${rating.toFixed(1)} / 10 · Puntuación global</div>
    </div>

    ${razonesHtml ? `
    <div class="veredicto-razones">
      <h5 class="veredicto-razones-titulo"><i class="fas fa-ticket-alt"></i> ¿Por qué vale la pena?</h5>
      <div class="veredicto-razones-lista">${razonesHtml}</div>
    </div>` : ''}

    <div class="veredicto-stats-row">
      <div class="veredicto-stat">
        <div class="veredicto-stat-value">${rating.toFixed(1)}</div>
        <div class="veredicto-stat-label">Puntuación</div>
      </div>
      <div class="veredicto-stat">
        <div class="veredicto-stat-value">${numEggs}</div>
        <div class="veredicto-stat-label">Easter Eggs</div>
      </div>
      <div class="veredicto-stat">
        <div class="veredicto-stat-value">${nivelCulto !== null ? '★'.repeat(nivelCulto) : numCurio}</div>
        <div class="veredicto-stat-label">${nivelCulto !== null ? 'Culto' : 'Curiosidades'}</div>
      </div>
    </div>`;
}

// ── MOSTRAR ENTRETENIMIENTO ───────────────────
function mostrarPeliculaEntretenimiento(pelicula, capas, media_type = 'movie') {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('movie-detail-entertainment').style.display = 'block';

  document.getElementById('ent-hero-img').src          = pelicula.backdrop_url || pelicula.poster_url || '';
  document.getElementById('ent-poster-img').src        = pelicula.poster_url || '';
  document.getElementById('ent-title').textContent     = pelicula.titulo;
  document.getElementById('ent-synopsis').textContent  = pelicula.sinopsis || '';
  document.getElementById('ent-year').textContent      = pelicula.anio || '';
  document.getElementById('ent-genre').textContent     = pelicula.director || '';
  document.getElementById('ent-rating').textContent    = pelicula.calificacion ? parseFloat(pelicula.calificacion).toFixed(1) : '-';

  const durInfoEnt = getInfoDuracion(pelicula, media_type);
  const durElEnt = document.getElementById('ent-duration');
  if (durElEnt) { durElEnt.textContent = durInfoEnt; durElEnt.style.display = durInfoEnt ? '' : 'none'; }

  const badgeContainer = document.getElementById('ent-badge-tipo');
  if (badgeContainer) badgeContainer.innerHTML = getBadgeAnalisis(media_type, 'entretenimiento');

  // Mapa de capas para el veredicto
  const capasMap = {};

  if (capas) {
    capas.forEach(capa => {
      try {
        const data = JSON.parse(capa.contenido);

        // El modelo a veces genera la capa fandom con key vacío ("").
        // Detectamos por estructura interna y la normalizamos.
        const nombre = capa.nombre_capa ||
          ((data.reacciones !== undefined || data.nivel_culto !== undefined) ? 'fandom' : '');

        capasMap[nombre] = data;

        // ── RESUMEN con score bars ────────────────
        if (nombre === 'resumen') {
          const scoreBars = _renderScoreBars(data.scores);
          document.getElementById('ent-resumen-content').innerHTML = `
            <p style="font-size:1.05rem;font-weight:600;color:#f5a623;
                      border-left:3px solid #f5a623;padding-left:1rem;
                      margin-bottom:1.75rem;line-height:1.7;">${data.intro}</p>
            ${scoreBars}
            <div style="display:flex;flex-direction:column;gap:0.85rem;">
              ${(data.puntos || []).map(p => `
                <div style="display:flex;gap:0.75rem;align-items:flex-start;padding:1rem;
                            background:rgba(245,166,35,0.08);border-radius:8px;
                            border-left:3px solid rgba(245,166,35,0.5);">
                  <i class="fas fa-check-circle" style="color:#f5a623;margin-top:3px;flex-shrink:0;"></i>
                  <span><strong style="color:var(--text-primary);">${p.titulo}</strong> ${p.texto}</span>
                </div>
              `).join('')}
            </div>`;
          setTimeout(_animarScoreBars, 150);
        }

        // ── MOMENTOS con reacción emocional ──────
        if (nombre === 'momentos') {
          const colorMap = { red:'#e74c3c', yellow:'#f1c40f', cyan:'#00bcd4', purple:'#9c27b0', green:'#2ecc71' };
          document.getElementById('ent-momentos-content').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1.5rem;">
              ${(Array.isArray(data) ? data : []).map(t => {
                const color   = colorMap[t.color] || '#f5a623';
                const emoji   = EMOJI_REACCION[t.color] || '🎬';
                return `
                <div style="display:flex;gap:1rem;align-items:flex-start;">
                  <div style="width:4px;min-height:80px;background:${color};border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
                  <div style="flex:1;padding:1rem;background:rgba(245,166,35,0.07);border-radius:8px;border:1px solid rgba(245,166,35,0.18);">
                    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem;flex-wrap:wrap;">
                      <span class="momento-reaction">${emoji}</span>
                      <span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${t.tiempo}</span>
                      <span style="padding:0.2rem 0.6rem;border-radius:4px;font-size:0.7rem;font-weight:700;
                                   background:${color}22;color:${color};">${t.tag}</span>
                    </div>
                    <h4 style="color:var(--text-primary);margin:0 0 0.5rem;font-size:1rem;">${t.titulo || 'Momento clave'}</h4>
                    <p style="color:var(--text-secondary);margin:0;font-size:0.9rem;line-height:1.6;">${t.texto}</p>
                  </div>
                </div>`;
              }).join('')}
            </div>`;
        }

        // ── EASTER EGGS con badge de dificultad ──
        if (nombre === 'easter_eggs') {
          const eggs = Array.isArray(data) ? data : [];
          document.getElementById('ent-easter_eggs-content').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${eggs.map((e, i) => {
                const diff = _eggDificultad(e, i);
                return `
                <div style="display:flex;gap:1rem;align-items:flex-start;padding:1rem;
                            background:rgba(245,166,35,0.07);border-radius:10px;
                            border:1px solid rgba(245,166,35,0.20);">
                  <div style="width:42px;height:42px;background:rgba(245,166,35,0.12);border-radius:50%;
                              display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem;">
                    🥚
                  </div>
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;flex-wrap:wrap;">
                      <h4 style="color:var(--text-primary);margin:0;font-size:0.95rem;">${e.titulo}</h4>
                      <span class="egg-difficulty egg-${diff}">${DIFF_LABELS[diff]}</span>
                    </div>
                    <p style="color:var(--text-secondary);margin:0;font-size:0.88rem;line-height:1.6;">${e.texto}</p>
                  </div>
                </div>`;
              }).join('')}
            </div>`;
        }

        // ── CURIOSIDADES ─────────────────────────
        if (nombre === 'curiosidades') {
          document.getElementById('ent-curiosidades-content').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
              ${(Array.isArray(data) ? data : []).map(c => `
                <div style="padding:1.5rem;background:rgba(245,166,35,0.07);border-radius:12px;
                            border:1px solid rgba(245,166,35,0.18);text-align:center;
                            transition:border-color 0.2s,background 0.2s;"
                     onmouseenter="this.style.borderColor='rgba(245,166,35,0.40)';this.style.background='rgba(245,166,35,0.12)'"
                     onmouseleave="this.style.borderColor='rgba(245,166,35,0.18)';this.style.background='rgba(245,166,35,0.07)'">
                  <i class="${c.icono}" style="font-size:1.8rem;color:#f5a623;margin-bottom:0.75rem;display:block;"></i>
                  <h4 style="color:var(--text-primary);margin:0 0 0.5rem;font-size:0.95rem;">${c.titulo}</h4>
                  <p style="color:var(--text-secondary);margin:0;font-size:0.85rem;line-height:1.5;">${c.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        // ── FANDOM ───────────────────────────────
        if (nombre === 'fandom') {
          const el = document.getElementById('ent-fandom-content');
          if (el) el.innerHTML = _renderFandom(data);
        }

      } catch(e) {
        const el = document.getElementById(`ent-${nombre || capa.nombre_capa}-content`);
        if (el) el.textContent = capa.contenido;
      }
    });
  }

  // ── FANDOM fallback para análisis sin capa fandom ────────────
  const fandomEl = document.getElementById('ent-fandom-content');
  if (fandomEl && fandomEl.textContent.trim() === 'Cargando...') {
    fandomEl.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;color:var(--text-muted);">
        <i class="fas fa-users" style="font-size:2rem;margin-bottom:0.75rem;display:block;color:#f5a623;opacity:0.35;"></i>
        <p style="font-size:0.9rem;">No hay datos de fandom para este análisis.</p>
      </div>`;
  }

  // ── VEREDICTO (generado del frontend) ────────
  const veredictoEl = document.getElementById('ent-veredicto-content');
  if (veredictoEl) veredictoEl.innerHTML = _renderVeredicto(pelicula, capasMap);

  renderizarReparto(pelicula.reparto, 'ent-reparto-section');
  cargarYouTube(pelicula, 'entretenimiento', 'ent-youtube-section');
  renderizarSimilares(pelicula.similares, 'ent-similares-section');
  iniciarSinopsisExpandible(pelicula, media_type, 'ent-synopsis');

  const btnGuardar = document.getElementById('btn-guardar-ent');
  if (btnGuardar) btnGuardar.onclick = () => guardarFavorito(pelicula.id);
}

// ── MOSTRAR PROFUNDO ──────────────────────────
function mostrarPeliculaProfunda(pelicula, capas, media_type = 'movie') {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('movie-detail-profound').style.display = 'block';

  document.getElementById('prof-hero-img').src = pelicula.backdrop_url || pelicula.poster_url || '';
  document.getElementById('prof-poster-img').src       = pelicula.poster_url || '';
  document.getElementById('prof-title').textContent    = pelicula.titulo;
  document.getElementById('prof-synopsis').textContent = pelicula.sinopsis || '';
  document.getElementById('prof-year').textContent     = pelicula.anio || '';
  document.getElementById('prof-genre').textContent    = pelicula.director || '';
  document.getElementById('prof-rating').textContent   = pelicula.calificacion ? parseFloat(pelicula.calificacion).toFixed(1) : '-';
  const durInfoProf = getInfoDuracion(pelicula, media_type);
const durElProf = document.getElementById('prof-duration');
if (durElProf) {
    durElProf.textContent = durInfoProf;
    durElProf.style.display = durInfoProf ? '' : 'none';
}

   const badgeContainer = document.getElementById('prof-badge-tipo');
  if (badgeContainer) badgeContainer.innerHTML = getBadgeAnalisis(media_type, 'profundo');

  if (capas) {
    capas.forEach(capa => {
      try {
        const data = JSON.parse(capa.contenido);

        if (capa.nombre_capa === 'narrativa') {
          document.getElementById('prof-narrativa-content').innerHTML = `
            <p style="font-size:1.05rem;font-style:italic;color:#f5a623;margin-bottom:2rem;line-height:1.7;
                      border-left:3px solid #f5a623;padding-left:1rem;">${data.intro}</p>
            ${(data.secciones || []).map(s => `
              <div style="margin-bottom:2rem;padding:1.5rem;background:rgba(155,89,182,0.10);border-radius:12px;border:1px solid rgba(155,89,182,0.25);">
                <h4 style="color:var(--text-primary);font-size:1.05rem;margin:0 0 0.75rem;">${s.titulo}</h4>
                <p style="color:var(--text-secondary);line-height:1.8;margin:0 0 ${s.cita && s.cita.texto && s.cita.texto !== 'undefined' ? '1rem' : '0'};">${s.texto}</p>
                ${s.cita && s.cita.texto && s.cita.texto !== 'undefined' && s.cita.fuente && s.cita.fuente !== 'undefined' ? `
                  <div style="margin-top:1rem;padding:1rem 1.5rem;background:rgba(245,166,35,0.08);
                              border-left:3px solid #f5a623;border-radius:0 8px 8px 0;">
                    <i class="fas fa-quote-left" style="color:#f5a623;margin-bottom:0.5rem;display:block;"></i>
                    <blockquote style="color:var(--text-secondary);font-style:italic;margin:0 0 0.5rem;line-height:1.6;">"${s.cita.texto}"</blockquote>
                    <cite style="color:var(--text-muted);font-size:0.8rem;">— ${s.cita.fuente}</cite>
                  </div>
                ` : ''}
              </div>
            `).join('')}`;
        }

        if (capa.nombre_capa === 'simbolismo') {
          document.getElementById('prof-simbolismo-content').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
              ${(Array.isArray(data) ? data : []).map(s => `
                <div style="padding:1.5rem;background:rgba(155,89,182,0.10);border-radius:12px;border:1px solid rgba(155,89,182,0.25);">
                  <div style="width:48px;height:48px;background:rgba(245,166,35,0.15);border-radius:12px;
                              display:flex;align-items:center;justify-content:center;margin-bottom:1rem;">
                    <i class="${s.icono}" style="font-size:1.3rem;color:#f5a623;"></i>
                  </div>
                  <h4 style="color:var(--text-primary);margin:0 0 0.5rem;font-size:0.95rem;">${s.titulo}</h4>
                  <p style="color:var(--text-secondary);margin:0;font-size:0.88rem;line-height:1.6;">${s.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'contexto') {
          document.getElementById('prof-contexto-content').innerHTML = `
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.7;">${data.intro || ''}</p>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(data.items || []).map(c => `
                <div style="padding:1.5rem;background:rgba(155,89,182,0.10);border-radius:12px;border-left:3px solid rgba(245,166,35,0.5);">
                  <h4 style="color:#f5a623;margin:0 0 0.5rem;display:flex;align-items:center;gap:0.5rem;">
                    <i class="${c.icono}"></i> ${c.titulo}
                  </h4>
                  <p style="color:var(--text-secondary);margin:0;line-height:1.7;">${c.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'tecnica') {
          document.getElementById('prof-tecnica-content').innerHTML = `
            <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.7;font-style:italic;">${data.intro || ''}</p>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              ${(data.aspectos || []).map(a => `
                <div style="padding:1.5rem;background:rgba(155,89,182,0.10);border-radius:12px;border:1px solid rgba(155,89,182,0.25);">
                  <h4 style="color:var(--text-primary);margin:0 0 0.5rem;font-size:0.95rem;">
                    <span style="color:#f5a623;">▸</span> ${a.titulo}
                  </h4>
                  <p style="color:var(--text-secondary);margin:0;line-height:1.7;">${a.texto}</p>
                </div>
              `).join('')}
            </div>`;
        }

        if (capa.nombre_capa === 'conclusion') {
  const el = document.getElementById('prof-conclusion-content');

  // Normaliza teorias_en_conflicto si el modelo lo devolvió como array
  function normalizarTexto(valor) {
    if (typeof valor === 'string') return valor;
    if (Array.isArray(valor)) {
      return valor.map(t => {
        if (typeof t === 'string') return t;
        // Si cada item tiene campos como {nombre, texto, pista}
        const nombre = t.nombre || t.titulo || t.teoria || '';
        const texto  = t.texto  || t.descripcion || t.contenido || '';
        const pista  = t.pista  || t.evidencia   || '';
        return [nombre ? `${nombre}:` : '', texto, pista].filter(Boolean).join(' ');
      }).join(' ');
    }
    if (typeof valor === 'object' && valor !== null) return JSON.stringify(valor);
    return String(valor || '');
  }

  if (typeof data === 'object' && data !== null && data.tesis_final) {
    const cierreTexto = data.sentencia || data.frase_impacto || '';
    const teorias     = normalizarTexto(data.teorias_en_conflicto);

    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">

        <div style="padding:1.5rem;background:rgba(245,166,35,0.06);border-radius:12px;
                    border-left:3px solid #f5a623;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <i class="fas fa-gavel" style="color:#f5a623;font-size:0.9rem;"></i>
            <span style="color:#f5a623;font-size:0.8rem;font-weight:700;letter-spacing:0.05em;
                         text-transform:uppercase;">Veredicto</span>
          </div>
          <p style="color:var(--text-secondary);line-height:1.85;font-size:0.97rem;margin:0;">${data.tesis_final}</p>
        </div>

        <div style="padding:1.5rem;background:rgba(156,39,176,0.06);border-radius:12px;
                    border-left:3px solid #9c27b0;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <i class="fas fa-balance-scale" style="color:#9c27b0;font-size:0.9rem;"></i>
            <span style="color:#9c27b0;font-size:0.8rem;font-weight:700;letter-spacing:0.05em;
                         text-transform:uppercase;">Teorías en conflicto</span>
          </div>
          <p style="color:var(--text-secondary);line-height:1.85;font-size:0.97rem;margin:0;">${teorias}</p>
        </div>

        ${cierreTexto ? `
        <div style="padding:1.25rem 1.75rem;background:rgba(155,89,182,0.08);border-radius:12px;
                    border:1px solid rgba(155,89,182,0.25);text-align:center;">
          <i class="fas fa-quote-left" style="color:var(--text-muted);font-size:0.8rem;margin-right:0.4rem;"></i>
          <span style="color:var(--text-primary);font-size:1.05rem;font-style:italic;font-weight:500;
                       line-height:1.6;">${cierreTexto}</span>
          <i class="fas fa-quote-right" style="color:var(--text-muted);font-size:0.8rem;margin-left:0.4rem;"></i>
        </div>` : ''}

      </div>`;

  } else {
    // Fallback para análisis viejos (conclusion como string)
    const texto = typeof data === 'string' ? data : JSON.stringify(data);
    el.innerHTML = `
      <div style="padding:2rem;background:rgba(245,166,35,0.05);border-radius:12px;
                  border:1px solid rgba(245,166,35,0.2);">
        <p style="color:var(--text-secondary);line-height:1.9;font-size:1rem;margin:0;">${texto}</p>
      </div>`;
  }
}

        if (capa.nombre_capa === 'momentos') {
          const colorMap = { red:'#e74c3c', yellow:'#f1c40f', cyan:'#00bcd4', purple:'#9c27b0', green:'#2ecc71' };
          document.getElementById('prof-momentos-content').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:1.5rem;">
              ${(Array.isArray(data) ? data : []).map(t => `
                <div style="display:flex;gap:1rem;align-items:flex-start;">
                  <div style="width:4px;min-height:80px;background:${colorMap[t.color]||'#f5a623'};border-radius:2px;flex-shrink:0;margin-top:4px;"></div>
                  <div style="flex:1;padding:1rem;background:rgba(155,89,182,0.10);border-radius:8px;border:1px solid rgba(155,89,182,0.20);">
                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                      <span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${t.tiempo}</span>
                      <span style="padding:0.2rem 0.6rem;border-radius:4px;font-size:0.7rem;font-weight:700;
                                   background:${colorMap[t.color]||'#f5a623'}22;color:${colorMap[t.color]||'#f5a623'};">${t.tag}</span>
                    </div>
                    <h4 style="color:var(--text-primary);margin:0 0 0.5rem;font-size:1rem;">${t.titulo || 'Momento clave'}</h4>
                    <p style="color:var(--text-secondary);margin:0;font-size:0.9rem;line-height:1.6;">${t.texto}</p>
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

  renderizarReparto(pelicula.reparto, 'prof-reparto-section');
  cargarYouTube(pelicula, 'profundo', 'prof-youtube-section');
  renderizarSimilares(pelicula.similares, 'prof-similares-section');

  iniciarSinopsisExpandible(pelicula, media_type, 'prof-synopsis');

  const btnGuardar = document.getElementById('btn-guardar-prof');
  if (btnGuardar) btnGuardar.onclick = () => guardarFavorito(pelicula.id);
}

// ── GUARDAR FAVORITO ──────────────────────────
async function guardarFavorito(pelicula_id) {
  if (!getToken()) { window.location.href = 'login.html'; return; }
  try {
    const res = await fetch(`${API_URL}/usuarios/favoritos/${pelicula_id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const swalBase = { scrollbarPadding: false, heightAuto: false };
    if (data.ok) {
      Swal.fire({ ...swalBase, icon:'success', title:'¡Guardado!', text:'Película agregada a favoritos',
        background:'#1a1a1a', color:'#ffffff', iconColor:'#f5a623', confirmButtonColor:'#f5a623',
        timer:2000, timerProgressBar:true, showConfirmButton:false });
    } else if (data.error?.includes('ya está')) {
      Swal.fire({ ...swalBase, icon:'warning', title:'Aviso', text:'Esta película ya está en tus favoritos',
        background:'#1a1a1a', color:'#ffffff', confirmButtonColor:'#f5a623' });
    } else {
      Swal.fire({ ...swalBase, icon:'error', title:'Error', text:data.error||'Error al guardar',
        background:'#1a1a1a', color:'#ffffff', confirmButtonColor:'#f5a623' });
    }
  } catch (err) { console.error('Error guardando favorito:', err); }
}

// ── ERROR / REINTENTAR ────────────────────────
function mostrarError(mensaje, conReintentar = false, tmdb_id = null) {
    document.getElementById('loader-normal').style.display = 'none';
    document.getElementById('loader-error').style.display = 'block';
    document.getElementById('loader-error-msg').textContent = mensaje;
    const btn = document.getElementById('btn-reintentar');
    if (conReintentar && tmdb_id) {
        btn.style.display = 'inline-flex';
        btn.onclick = () => {
            document.getElementById('loader-normal').style.display = 'block';
            document.getElementById('loader-error').style.display = 'none';
            cargarAnalisis(tmdb_id);
        };
    } else {
        btn.style.display = 'none';
    }
}

// ── PROGRESS BAR ──────────────────────────────
let _progressInterval = null;
let _progressValue    = 0;

function startProgressBar() {
    _progressValue = 0;
    const fill = document.getElementById('loader-bar-fill');
    const pct  = document.getElementById('loader-percent');
    if (fill) fill.style.width = '0%';
    if (pct)  pct.textContent  = '0%';

    _progressInterval = setInterval(() => {
        const remaining = 90 - _progressValue;
        const increment = Math.max(0.2, remaining * 0.035);
        _progressValue  = Math.min(90, _progressValue + increment);
        if (fill) fill.style.width = _progressValue.toFixed(1) + '%';
        if (pct)  pct.textContent  = Math.floor(_progressValue) + '%';
        if (_progressValue >= 90) clearInterval(_progressInterval);
    }, 180);
}

function finishProgressBar(callback) {
    clearInterval(_progressInterval);
    const fill = document.getElementById('loader-bar-fill');
    const pct  = document.getElementById('loader-percent');
    if (fill) fill.style.width = '100%';
    if (pct)  pct.textContent  = '100%';
    setTimeout(callback, 450);
}

function stopProgressBar() {
    clearInterval(_progressInterval);
}

// ── CARGAR ANÁLISIS ───────────────────────────
async function cargarAnalisis(tmdb_id, force = false) {
    const media_type = getMediaType();
    startProgressBar();

    try {
        // Pasar media_type para que el controller bifurque movie/tv
        const resPelicula = await fetch(`${API_URL}/peliculas/${tmdb_id}?media_type=${media_type}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const dataPelicula = await resPelicula.json();
        if (!dataPelicula.ok) { mostrarError('No se encontró el contenido.', false); return; }

        const pelicula = dataPelicula.data.pelicula;

        // Actualizar el nav con el título de la película
        const navLink = document.getElementById('nav-analisis-link');
        if (navLink && pelicula.titulo) {
            const titulo = pelicula.titulo.length > 24 ? pelicula.titulo.slice(0, 22) + '…' : pelicula.titulo;
            navLink.textContent = titulo;
            navLink.title = pelicula.titulo;
        }

        const resAnalisis = await fetch(`${API_URL}/analisis/${pelicula.id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const dataAnalisis = await resAnalisis.json();

        let capas = null;

        if (dataAnalisis.ok && dataAnalisis.data.analisis.estado === 'completo') {
            capas = dataAnalisis.data.analisis.capas;
            if (dataAnalisis.data.analisis.reparto)   pelicula.reparto   = dataAnalisis.data.analisis.reparto;
            if (dataAnalisis.data.analisis.similares) pelicula.similares = dataAnalisis.data.analisis.similares;
        } else {
            if (!getToken()) {
                stopProgressBar();
                document.getElementById('loader-normal').style.display = 'none';
                document.getElementById('loader-error').style.display = 'block';
                document.getElementById('loader-error-msg').textContent = 'Inicia sesión para generar el análisis';
                document.getElementById('btn-reintentar').innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar sesión';
                document.getElementById('btn-reintentar').style.display = 'inline-flex';
                document.getElementById('btn-reintentar').onclick = () => window.location.href = 'login.html';
                return;
            }

            const resGenerar = await fetch(`${API_URL}/analisis/generar/${pelicula.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ force })
            });

            if (resGenerar.status === 401) {
                stopProgressBar();
                localStorage.removeItem('mf_token');
                document.getElementById('loader-normal').style.display = 'none';
                document.getElementById('loader-error').style.display = 'block';
                document.getElementById('loader-error-msg').textContent = 'Tu sesión expiró. Inicia sesión para continuar.';
                document.getElementById('btn-reintentar').innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar sesión';
                document.getElementById('btn-reintentar').style.display = 'inline-flex';
                document.getElementById('btn-reintentar').onclick = () => window.location.href = 'login.html';
                return;
            }

            const dataGenerar = await resGenerar.json();

            if (dataGenerar.ok) {
                capas = dataGenerar.data.analisis.capas;
                if (dataGenerar.data.analisis.reparto)   pelicula.reparto   = dataGenerar.data.analisis.reparto;
                if (dataGenerar.data.analisis.similares) pelicula.similares = dataGenerar.data.analisis.similares;
            } else {
                mostrarError('No se pudo generar el análisis. Intenta de nuevo.', true, tmdb_id);
                return;
            }
        }

        finishProgressBar(() => {
            if (pelicula.tipo_analisis === 'profundo') {
                mostrarPeliculaProfunda(pelicula, capas, media_type);
            } else {
                mostrarPeliculaEntretenimiento(pelicula, capas, media_type);
            }
        });

    } catch (err) {
        stopProgressBar();
        mostrarError('Error de conexión con el servidor.', true, tmdb_id);
    }
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tmdb_id = getTmdbId();
  if (!tmdb_id) { window.location.href = 'busqueda.html'; return; }
  cargarAnalisis(tmdb_id);
});