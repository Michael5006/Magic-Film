const API_URL = '/api';

function getToken() { return localStorage.getItem('mf_token'); }

// Verificar acceso admin
const usuario = JSON.parse(localStorage.getItem('mf_usuario') || '{}');
if (!getToken() || usuario.rol !== 'admin') {
    window.location.href = 'busqueda.html';
}

const GENEROS_DISPONIBLES = [
    { id: 28,    nombre: 'Acción' },
    { id: 18,    nombre: 'Drama' },
    { id: 35,    nombre: 'Comedia' },
    { id: 27,    nombre: 'Terror' },
    { id: 878,   nombre: 'Ciencia Ficción' },
    { id: 53,    nombre: 'Thriller' },
    { id: 10749, nombre: 'Romance' },
];

const CAPA_LABELS = {
    resumen:      { label: 'Resumen',                  icon: 'fa-align-left' },
    momentos:     { label: 'Momentos Especiales',      icon: 'fa-star' },
    easter_eggs:  { label: 'Easter Eggs',              icon: 'fa-egg' },
    curiosidades: { label: 'Curiosidades',             icon: 'fa-lightbulb' },
    narrativa:    { label: 'Narrativa',                icon: 'fa-book-open' },
    simbolismo:   { label: 'Simbolismo',               icon: 'fa-eye' },
    contexto:     { label: 'Contexto Histórico/Cultural', icon: 'fa-globe' },
    tecnica:      { label: 'Técnica Cinematográfica',  icon: 'fa-film' },
    conclusion:   { label: 'Conclusión',               icon: 'fa-flag-checkered' },
};

// ── TABS ──────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

// ── ESTADO GLOBAL ─────────────────────────────
let _usuariosData   = [];
let _peliculasData  = [];
let _peliculasSnap  = {};   // { id: estado_analisis } para detectar cambios
let _pollingTimer   = null;

// ── STATS ─────────────────────────────────────
async function cargarStats() {
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!data.ok) return;

        const s = data.data.stats;
        document.getElementById('stat-usuarios').textContent   = s.total_usuarios;
        document.getElementById('stat-peliculas').textContent  = s.total_peliculas;
        document.getElementById('stat-analisis').textContent   = s.total_analisis;
        document.getElementById('stat-pendientes').textContent = s.analisis_pendientes;
    } catch (err) {
        console.error('Error cargando stats:', err);
    }
}

// ── USUARIOS ──────────────────────────────────
function _renderFilaUsuario(u) {
    return `
        <tr data-uid="${u.id}">
            <td>${u.id}</td>
            <td><strong style="color:#fff;">${u.nombre_usuario}</strong>
                ${u.nombre_completo ? `<br><span style="color:#666;font-size:0.78rem;">${u.nombre_completo}</span>` : ''}
            </td>
            <td>${u.email}</td>
            <td>${u.nivel_cinefilo || '—'}</td>
            <td><span class="badge ${u.rol === 'admin' ? 'badge-admin' : 'badge-user'}">${u.rol}</span></td>
            <td>${new Date(u.creado_en).toLocaleDateString('es-CO')}</td>
            <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button class="btn-icon btn-warning" onclick='editarUsuario(${JSON.stringify(u)})' title="Editar usuario">
                    <i class="fas fa-user-edit"></i>
                </button>
                <button class="btn-icon btn-info" onclick='editarGenerosUsuario(${u.id}, "${u.nombre_usuario}")' title="Editar géneros">
                    <i class="fas fa-heart"></i>
                </button>
                ${u.rol !== 'admin' ? `
                <button class="btn-icon btn-danger" onclick="eliminarUsuario(${u.id}, '${u.nombre_usuario}')" title="Eliminar usuario">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        </tr>`;
}

function filtrarUsuarios(query) {
    const q = (query || '').toLowerCase().trim();
    const lista = q
        ? _usuariosData.filter(u =>
            (u.nombre_usuario  || '').toLowerCase().includes(q) ||
            (u.nombre_completo || '').toLowerCase().includes(q) ||
            (u.email           || '').toLowerCase().includes(q) ||
            (u.rol             || '').toLowerCase().includes(q))
        : _usuariosData;

    const tbody = document.getElementById('tabla-usuarios');
    tbody.innerHTML = lista.length
        ? lista.map(_renderFilaUsuario).join('')
        : '<tr><td colspan="7" class="table-loading">Sin resultados</td></tr>';
}

async function cargarUsuarios() {
    try {
        const res = await fetch(`${API_URL}/admin/usuarios`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!data.ok) return;

        _usuariosData = data.data.usuarios;
        const query = document.getElementById('search-usuarios')?.value || '';
        filtrarUsuarios(query);
    } catch (err) {
        console.error('Error cargando usuarios:', err);
    }
}

async function editarUsuario(u) {
    const { value, isConfirmed } = await Swal.fire({
        title: `<span style="color:#fff;font-size:1rem;">Editar usuario</span>`,
        html: `
            <div style="display:flex;flex-direction:column;gap:0.75rem;text-align:left;">
                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Nombre de usuario</label>
                <input id="edit-username" class="swal2-input" value="${u.nombre_usuario}" placeholder="nombre_usuario" style="margin:0;">
                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Nombre completo</label>
                <input id="edit-nombre" class="swal2-input" value="${u.nombre_completo || ''}" placeholder="Nombre Apellido" style="margin:0;">
                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Nivel cinéfilo</label>
                <select id="edit-nivel" class="swal2-select" style="margin:0;background:#1a1a1a;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:0.5rem;">
                    <option value="explorador"  ${u.nivel_cinefilo === 'explorador'  ? 'selected' : ''}>Explorador</option>
                    <option value="entusiasta"  ${u.nivel_cinefilo === 'entusiasta'  ? 'selected' : ''}>Entusiasta</option>
                    <option value="experto"     ${u.nivel_cinefilo === 'experto'     ? 'selected' : ''}>Experto</option>
                </select>
                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Rol</label>
                <select id="edit-rol" class="swal2-select" style="margin:0;background:#1a1a1a;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:0.5rem;">
                    <option value="registrado" ${u.rol === 'registrado' ? 'selected' : ''}>Registrado</option>
                    <option value="admin"      ${u.rol === 'admin'      ? 'selected' : ''}>Admin</option>
                </select>
                <p id="edit-user-error" style="color:#e74c3c;font-size:0.8rem;min-height:1rem;margin:0;"></p>
            </div>
        `,
        background: '#1a1a1a',
        color: '#fff',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f5a623',
        cancelButtonColor: '#333',
        preConfirm: () => {
            const nombre_usuario = document.getElementById('edit-username').value.trim();
            const nombre_completo = document.getElementById('edit-nombre').value.trim();
            const nivel_cinefilo = document.getElementById('edit-nivel').value;
            const rol = document.getElementById('edit-rol').value;
            if (!nombre_usuario) {
                document.getElementById('edit-user-error').textContent = 'El nombre de usuario es obligatorio';
                return false;
            }
            return { nombre_usuario, nombre_completo, nivel_cinefilo, rol };
        }
    });

    if (!isConfirmed || !value) return;

    try {
        const res = await fetch(`${API_URL}/admin/usuarios/${u.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify(value)
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: '¡Guardado!', text: data.data.mensaje,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623',
                timer: 1800, showConfirmButton: false });
            cargarUsuarios();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error editando usuario:', err);
    }
}

async function editarGenerosUsuario(userId, nombreUsuario) {
    // Obtener géneros actuales del usuario
    let actuales = [];
    try {
        const res = await fetch(`${API_URL}/admin/usuarios`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.ok) {
            // Fetch genres via perfil endpoint isn't available from admin — use a quick trick:
            // Get from the table DOM
        }
    } catch {}

    // Fetch géneros del usuario desde el endpoint de perfil (pasando su id)
    // Como no hay endpoint de admin para géneros de un usuario específico, los pedimos aparte
    try {
        const resG = await fetch(`${API_URL}/usuarios/generos`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        // Este endpoint devuelve los del admin logueado, no del usuario target
        // Por eso comparamos por nombre en el DOM
    } catch {}

    // Leemos géneros actuales desde el DOM de la fila del usuario
    // Solución más directa: mostrar todos sin pre-selección y dejar que el admin elija
    const chipsHTML = GENEROS_DISPONIBLES.map(g =>
        `<span class="admin-genre-chip" data-id="${g.id}" data-nombre="${g.nombre}">${g.nombre}</span>`
    ).join('');

    const { isConfirmed, value } = await Swal.fire({
        title: `<span style="color:#fff;font-size:1rem;">Géneros de <em style="color:#f5a623">${nombreUsuario}</em></span>`,
        html: `
            <p style="color:#888;font-size:0.82rem;margin-bottom:1rem;">Selecciona entre 1 y 3 géneros</p>
            <div id="admin-genre-wrap" style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;">
                ${chipsHTML}
            </div>
            <p id="admin-genre-error" style="color:#e74c3c;font-size:0.8rem;min-height:1.2rem;margin-top:0.75rem;"></p>
        `,
        background: '#1a1a1a',
        color: '#fff',
        showCancelButton: true,
        confirmButtonText: 'Guardar géneros',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f5a623',
        cancelButtonColor: '#333',
        didOpen: () => {
            document.querySelectorAll('.admin-genre-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const errEl = document.getElementById('admin-genre-error');
                    if (chip.classList.contains('active')) {
                        chip.classList.remove('active');
                    } else {
                        const activos = document.querySelectorAll('.admin-genre-chip.active').length;
                        if (activos >= 3) { errEl.textContent = 'Máximo 3 géneros'; return; }
                        chip.classList.add('active');
                    }
                    document.getElementById('admin-genre-error').textContent = '';
                });
            });
        },
        preConfirm: () => {
            const activos = [...document.querySelectorAll('.admin-genre-chip.active')];
            if (activos.length === 0) {
                document.getElementById('admin-genre-error').textContent = 'Selecciona al menos 1 género';
                return false;
            }
            return activos.map(c => ({ id: parseInt(c.dataset.id), nombre: c.dataset.nombre }));
        }
    });

    if (!isConfirmed || !value) return;

    try {
        const res = await fetch(`${API_URL}/admin/usuarios/${userId}/generos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ generos: value })
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: '¡Géneros actualizados!',
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623',
                timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error editando géneros usuario:', err);
    }
}

async function eliminarUsuario(id, nombre) {
    const confirm = await Swal.fire({
        title: '¿Eliminar usuario?',
        html: `Se eliminará <strong>${nombre}</strong> y todos sus datos permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#333',
        background: '#1a1a1a',
        color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: data.data.mensaje,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623', timer: 2000, showConfirmButton: false });
            cargarUsuarios();
            cargarStats();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error eliminando usuario:', err);
    }
}

// ── PELÍCULAS ─────────────────────────────────
function _renderFilaPelicula(p) {
    return `
        <tr data-pid="${p.id}">
            <td>${p.id}</td>
            <td><strong style="color:#fff;">${p.titulo}</strong>
                ${p.media_type === 'tv' ? '<br><span style="color:#666;font-size:0.75rem;">Serie</span>' : ''}
            </td>
            <td>${p.anio || '—'}</td>
            <td>${p.director || '—'}</td>
            <td><span class="badge ${p.tipo_analisis === 'profundo' ? 'badge-prof' : 'badge-ent'}">${p.tipo_analisis || '—'}</span></td>
            <td><span class="badge ${p.estado_analisis === 'completo' ? 'badge-ok' : 'badge-pending'}">${p.estado_analisis || 'sin análisis'}</span></td>
            <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button class="btn-icon btn-warning" onclick='editarPelicula(${JSON.stringify(p)})' title="Editar película">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                ${p.analisis_id && p.estado_analisis === 'completo' ? `
                <button class="btn-icon btn-info" onclick="abrirEditorAnalisis(${p.id}, '${p.titulo.replace(/'/g,"\\'")}', ${p.analisis_id})" title="Editar análisis">
                    <i class="fas fa-book-open"></i>
                </button>` : ''}
                ${p.analisis_id ? `
                <button class="btn-icon btn-success" onclick="eliminarAnalisis(${p.analisis_id}, '${p.titulo.replace(/'/g,"\\'")}' )" title="Forzar regeneración de análisis">
                    <i class="fas fa-redo"></i>
                </button>` : ''}
                <button class="btn-icon btn-danger" onclick="eliminarPelicula(${p.id})" data-titulo="${p.titulo.replace(/"/g, '&quot;')}" title="Eliminar película de la base de datos">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
}

function filtrarPeliculas(query) {
    const q = (query || '').toLowerCase().trim();
    const lista = q
        ? _peliculasData.filter(p =>
            (p.titulo    || '').toLowerCase().includes(q) ||
            (p.director  || '').toLowerCase().includes(q) ||
            String(p.anio || '').includes(q)              ||
            (p.tipo_analisis    || '').toLowerCase().includes(q) ||
            (p.estado_analisis  || '').toLowerCase().includes(q))
        : _peliculasData;

    const tbody = document.getElementById('tabla-peliculas');
    tbody.innerHTML = lista.length
        ? lista.map(_renderFilaPelicula).join('')
        : '<tr><td colspan="7" class="table-loading">Sin resultados</td></tr>';
}

async function cargarPeliculas(silencioso = false) {
    try {
        const res = await fetch(`${API_URL}/admin/peliculas`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!data.ok) return;

        const nuevas  = data.data.peliculas;
        const nuevaSnap = {};
        nuevas.forEach(p => { nuevaSnap[p.id] = p.estado_analisis; });

        // Detectar filas cuyo estado cambió (nuevo análisis completado)
        const cambiadas = new Set();
        if (silencioso && Object.keys(_peliculasSnap).length > 0) {
            nuevas.forEach(p => {
                const anterior = _peliculasSnap[p.id];
                if (anterior !== undefined && anterior !== p.estado_analisis) {
                    cambiadas.add(p.id);
                } else if (anterior === undefined) {
                    cambiadas.add(p.id);   // fila nueva
                }
            });
        }

        _peliculasData = nuevas;
        _peliculasSnap = nuevaSnap;

        const query = document.getElementById('search-peliculas')?.value || '';
        filtrarPeliculas(query);

        // Resaltar filas que cambiaron
        if (cambiadas.size > 0) {
            cambiadas.forEach(pid => {
                const fila = document.querySelector(`#tabla-peliculas tr[data-pid="${pid}"]`);
                if (fila) {
                    fila.classList.add('row-nueva');
                    setTimeout(() => fila.classList.remove('row-nueva'), 3000);
                }
            });
        }
    } catch (err) {
        console.error('Error cargando películas:', err);
    }
}

async function editarPelicula(p) {
    const sinopsisEscapada = (p.sinopsis || '').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const { isConfirmed, value } = await Swal.fire({
        title: `<span style="color:#fff;font-size:1rem;">Editar película</span>`,
        width: '680px',
        html: `
            <div style="display:flex;flex-direction:column;gap:0.75rem;text-align:left;">
                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Título *</label>
                <input id="ep-titulo" class="swal2-input" value="${p.titulo}" style="margin:0;">

                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Director</label>
                <input id="ep-director" class="swal2-input" value="${p.director || ''}" placeholder="Director" style="margin:0;">

                <div style="display:flex;gap:0.75rem;">
                    <div style="flex:1;">
                        <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Año</label>
                        <input id="ep-anio" class="swal2-input" type="number" value="${p.anio || ''}" placeholder="2024" style="margin:0.25rem 0 0 0;width:100%;box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Tipo de análisis</label>
                        <select id="ep-tipo" style="margin:0.25rem 0 0 0;width:100%;background:#1a1a1a;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:0.5rem;box-sizing:border-box;">
                            <option value="entretenimiento" ${p.tipo_analisis === 'entretenimiento' ? 'selected' : ''}>Entretenimiento</option>
                            <option value="profundo" ${p.tipo_analisis === 'profundo' ? 'selected' : ''}>Profundo</option>
                        </select>
                    </div>
                </div>

                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">Sinopsis</label>
                <textarea id="ep-sinopsis" class="swal2-textarea" style="margin:0;min-height:90px;resize:vertical;">${p.sinopsis || ''}</textarea>

                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">URL Poster</label>
                <input id="ep-poster" class="swal2-input" value="${p.poster_url || ''}" placeholder="https://..." style="margin:0;">

                <label style="color:#888;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;">URL Backdrop</label>
                <input id="ep-backdrop" class="swal2-input" value="${p.backdrop_url || ''}" placeholder="https://..." style="margin:0;">

                <p id="ep-error" style="color:#e74c3c;font-size:0.8rem;min-height:1rem;margin:0;"></p>
            </div>
        `,
        background: '#1a1a1a',
        color: '#fff',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f5a623',
        cancelButtonColor: '#333',
        preConfirm: () => {
            const titulo = document.getElementById('ep-titulo').value.trim();
            if (!titulo) { document.getElementById('ep-error').textContent = 'El título es obligatorio'; return false; }
            return {
                titulo,
                director:      document.getElementById('ep-director').value.trim(),
                anio:          document.getElementById('ep-anio').value || null,
                tipo_analisis: document.getElementById('ep-tipo').value,
                sinopsis:      document.getElementById('ep-sinopsis').value.trim(),
                poster_url:    document.getElementById('ep-poster').value.trim(),
                backdrop_url:  document.getElementById('ep-backdrop').value.trim(),
            };
        }
    });

    if (!isConfirmed || !value) return;

    try {
        const res = await fetch(`${API_URL}/admin/peliculas/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify(value)
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: '¡Guardado!', text: data.data.mensaje,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623',
                timer: 1800, showConfirmButton: false });
            cargarPeliculas();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error editando película:', err);
    }
}

async function eliminarAnalisis(id, titulo) {
    const confirm = await Swal.fire({
        title: '¿Regenerar análisis?',
        html: `Se eliminará el análisis de <strong>${titulo}</strong>. Se regenerará automáticamente al próximo acceso.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, regenerar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f5a623',
        cancelButtonColor: '#333',
        background: '#1a1a1a',
        color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/admin/analisis/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: 'Listo', text: data.data.mensaje,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623', timer: 2000, showConfirmButton: false });
            cargarPeliculas();
            cargarStats();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error eliminando análisis:', err);
    }
}

async function eliminarPelicula(id) {
    const btn   = document.querySelector(`[onclick="eliminarPelicula(${id})"]`);
    const titulo = btn?.dataset.titulo || 'esta película';
    const confirm = await Swal.fire({
        title: '¿Eliminar película?',
        html: `Se eliminará <strong>${titulo}</strong> de la base de datos junto con su análisis.<br><br>
               <span style="color:#f5a623;font-size:0.85rem;">Al volver a buscarla se reclasificará automáticamente con la IA.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#333',
        background: '#1a1a1a',
        color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API_URL}/admin/peliculas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (data.ok) {
            Swal.fire({ icon: 'success', title: 'Eliminada', text: data.data.mensaje,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623',
                timer: 2000, showConfirmButton: false });
            cargarPeliculas();
            cargarStats();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        console.error('Error eliminando película:', err);
    }
}

// ── EDITOR DE ANÁLISIS ────────────────────────
async function abrirEditorAnalisis(peliculaId, titulo, analisisId) {
    const overlay = document.getElementById('analisis-editor');
    const body    = document.getElementById('analisis-editor-body');
    const titleEl = document.getElementById('analisis-editor-title');

    titleEl.textContent = `Editor — ${titulo}`;
    body.innerHTML = '<p style="color:#666;text-align:center;padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Cargando capas...</p>';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        const res = await fetch(`${API_URL}/admin/peliculas/${peliculaId}/analisis`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (!data.ok) {
            body.innerHTML = `<p style="color:#e74c3c;text-align:center;padding:2rem;">${data.error || 'Error al cargar el análisis'}</p>`;
            return;
        }

        const { capas } = data.data;

        body.innerHTML = capas.map(capa => {
            const info = CAPA_LABELS[capa.nombre_capa] || { label: capa.nombre_capa, icon: 'fa-file-alt' };
            const contenidoEscapado = (capa.contenido || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
                <div class="capa-editor-card" data-capa-id="${capa.id}">
                    <div class="capa-editor-label">
                        <i class="fas ${info.icon}"></i> ${info.label}
                    </div>
                    <textarea class="capa-editor-textarea" id="capa-ta-${capa.id}">${contenidoEscapado}</textarea>
                    <div class="capa-editor-footer">
                        <button class="btn-save-capa" onclick="guardarCapa(${capa.id})">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        body.innerHTML = `<p style="color:#e74c3c;text-align:center;padding:2rem;">Error de conexión</p>`;
        console.error('Error cargando capas:', err);
    }
}

function cerrarEditorAnalisis() {
    document.getElementById('analisis-editor').style.display = 'none';
    document.body.style.overflow = '';
}

async function guardarCapa(capaId) {
    const textarea = document.getElementById(`capa-ta-${capaId}`);
    const btn = textarea.closest('.capa-editor-card').querySelector('.btn-save-capa');
    const contenido = textarea.value;

    if (!contenido.trim()) {
        Swal.fire({ icon: 'warning', title: 'El contenido no puede estar vacío',
            background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623', timer: 1500, showConfirmButton: false });
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const res = await fetch(`${API_URL}/admin/capas/${capaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ contenido })
        });
        const data = await res.json();

        if (data.ok) {
            btn.innerHTML = '<i class="fas fa-check"></i> Guardado';
            btn.style.borderColor = 'rgba(46,204,113,0.5)';
            btn.style.color = 'var(--accent-green)';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
            Swal.fire({ icon: 'error', title: 'Error', text: data.error,
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f5a623' });
        }
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
        console.error('Error guardando capa:', err);
    }
}

// Cerrar editor con Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarEditorAnalisis();
});

// ── HISTORIAL ─────────────────────────────────
async function cargarHistorial() {
    try {
        const res = await fetch(`${API_URL}/admin/historial`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!data.ok) return;

        const accionBadge = {
            modificar:     'badge-ok',
            eliminar:      'badge-pending',
            regenerar_ia:  'badge-warning',
            agregar:       'badge-prof',
        };

        const tbody = document.getElementById('tabla-historial');
        if (data.data.historial.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Sin actividad registrada</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.historial.map(h => `
            <tr>
                <td>${new Date(h.realizado_en).toLocaleString('es-CO')}</td>
                <td><strong style="color:#fff;">${h.nombre_usuario}</strong></td>
                <td><span class="badge ${accionBadge[h.accion] || 'badge-user'}">${h.accion}</span></td>
                <td>${h.entidad} #${h.entidad_id}</td>
                <td>${h.detalle || '—'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando historial:', err);
    }
}

// ── POLLING EN TIEMPO REAL ────────────────────
let _ultimaActualizacion = null;

function actualizarLiveTime() {
    const el = document.getElementById('live-time');
    if (!el || !_ultimaActualizacion) return;
    const seg = Math.round((Date.now() - _ultimaActualizacion) / 1000);
    el.textContent = seg < 5 ? 'ahora' : `hace ${seg}s`;
}

async function pollAdmin() {
    await Promise.all([cargarStats(), cargarPeliculas(true)]);
    _ultimaActualizacion = Date.now();
    actualizarLiveTime();
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([cargarStats(), cargarUsuarios(), cargarPeliculas(), cargarHistorial()]);
    _ultimaActualizacion = Date.now();
    actualizarLiveTime();

    // Actualizar el contador "hace Xs" cada segundo
    setInterval(actualizarLiveTime, 1000);

    // Poll stats + películas cada 15 segundos
    _pollingTimer = setInterval(pollAdmin, 15000);
});
