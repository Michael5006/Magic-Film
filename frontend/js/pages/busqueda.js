const API_URL = '/api';

function getToken() { return localStorage.getItem('mf_token'); }

let searchTimeout = null;

// ── BADGE por tipo de contenido ───────────────────────────────
function getBadgeMedia(p) {
    const estiloBase = `
        display:inline-block;
        padding:0.15rem 0.5rem;
        border-radius:4px;
        font-size:0.6rem;
        font-weight:700;
        letter-spacing:0.05em;
        text-transform:uppercase;
        margin-bottom:0.3rem;
    `;

    if (p.media_type === 'tv') {
        if (p.original_language === 'ja')
            return `<span style="${estiloBase}background:rgba(255,89,89,0.2);color:#ff5959;border:1px solid rgba(255,89,89,0.4);">Anime</span>`;
        if (p.original_language === 'ko')
            return `<span style="${estiloBase}background:rgba(168,85,247,0.2);color:#a855f7;border:1px solid rgba(168,85,247,0.4);">K-Drama</span>`;
        return `<span style="${estiloBase}background:rgba(59,130,246,0.2);color:#60a5fa;border:1px solid rgba(59,130,246,0.4);">Serie</span>`;
    }

    // Película — siempre mostrar
    return `<span style="${estiloBase}background:rgba(245,166,35,0.15);color:#f5a623;border:1px solid rgba(245,166,35,0.3);">Película</span>`;
}

// ── BUSCAR ────────────────────────────────────────────────────
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
        if (data.ok) mostrarResultados(data.data.peliculas);
    } catch (err) {}
}

function mostrarResultados(peliculas) {
    const grid            = document.getElementById('resultsGrid');
    const section         = document.getElementById('searchResults');
    const recommendations = document.getElementById('recommendations');

    grid.innerHTML = peliculas.length === 0
        ? `<div style="grid-column:1/-1; text-align:center; padding:3rem 1rem;">
             <i class="fas fa-film" style="font-size:2.5rem; color:#333; display:block; margin-bottom:1rem;"></i>
             <p style="color:#555; font-size:1rem; margin:0 0 0.4rem;">No encontramos resultados</p>
             <p style="color:#444; font-size:0.85rem; margin:0;">Intenta con otro título o revisa la ortografía</p>
           </div>`
        : peliculas.map(p => {
            const destino = `analisis.html?tmdb_id=${p.tmdb_id}&media_type=${p.media_type || 'movie'}`;
            return `
                <div class="movie-item" onclick="window.location.href='${destino}'" style="position:relative;">
                    <div class="movie-poster">
                        <img src="${p.poster_url || 'https://i.ibb.co/TxjhW06S/Cartel-vintage-de-pel-cula-perdida.png'}" alt="${p.titulo}">
                    </div>
                    <div style="text-align:center; margin-top:0.4rem;">
                        ${getBadgeMedia(p)}
                        <span class="movie-name" style="display:block;">${p.titulo}</span>
                        <span class="movie-year">${p.anio || ''}</span>
                    </div>
                </div>
            `;
        }).join('');

    // Stagger: asignar índice a cada card para que el delay CSS sea escalonado
    grid.querySelectorAll('.movie-item').forEach((el, i) => {
        el.style.setProperty('--card-i', i);
    });

    section.style.display = 'block';
    recommendations.style.display = 'none';
}

window.quickSearch = function(termino) {
    document.getElementById('searchInput').value = termino;
    buscar(termino);
};

window.quickSearchPorId = async function(genero_id, nombre) {
    document.getElementById('searchInput').value = nombre;
    document.getElementById('recommendations').style.display = 'none';

    try {
        const res  = await fetch(`${API_URL}/peliculas/genero/${genero_id}`);
        const data = await res.json();
        if (data.ok) mostrarResultados(data.data.peliculas);
    } catch (err) {}
};

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

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

    const CHIPS_DEFAULT = `
        <span class="quick-tag" onclick="quickSearchPorId(28, 'Acción')">Acción</span>
        <span class="quick-tag" onclick="quickSearchPorId(878, 'Ciencia Ficción')">Ciencia Ficción</span>
        <span class="quick-tag" onclick="quickSearchPorId(35, 'Comedia')">Comedia</span>
        <span class="quick-tag" onclick="quickSearchPorId(27, 'Terror')">Terror</span>
        <span class="quick-tag" onclick="quickSearchPorId(18, 'Drama')">Drama</span>
    `;

    const quickTags   = document.getElementById('quick-tags');
    const tituloRecom = document.querySelector('.recommendations h3');
    const grid        = document.getElementById('movie-grid');

    try {
        let url           = `${API_URL}/peliculas/populares`;
        let tituloSeccion = 'RECOMENDADO PARA TI';

        const token = getToken();
        if (token) {
            const perfilRes  = await fetch(`${API_URL}/usuarios/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const perfilData = await perfilRes.json();

            let generos = perfilData?.data?.usuario?.generos_favoritos;
            if (typeof generos === 'string') {
                try { generos = JSON.parse(generos); } catch { generos = []; }
            }

            if (Array.isArray(generos) && generos.length > 0) {
                if (quickTags) {
                    quickTags.innerHTML = generos.map(g => `
                        <span class="quick-tag" onclick="quickSearchPorId(${g.id}, '${g.nombre}')">
                            ${g.nombre}
                        </span>
                    `).join('');
                }
                // Con 2+ géneros favoritos: combinar dos con AND (lógica TMDB coma)
                // Drama,Thriller → solo thrillers dramáticos/psicológicos
                // Drama,Terror  → terror con peso narrativo
                // Mucho más preciso que un solo género con sort por popularidad
                if (generos.length >= 2) {
                    const mezclados = [...generos].sort(() => Math.random() - 0.5);
                    const [g1, g2]  = mezclados;
                    url           = `${API_URL}/peliculas/genero/${g1.id},${g2.id}`;
                    tituloSeccion = `PORQUE TE GUSTAN ${g1.nombre.toUpperCase()} Y ${g2.nombre.toUpperCase()}`;
                } else {
                    const g       = generos[0];
                    url           = `${API_URL}/peliculas/genero/${g.id}`;
                    tituloSeccion = `PORQUE TE GUSTA ${g.nombre.toUpperCase()}`;
                }
            } else {
                if (quickTags) quickTags.innerHTML = CHIPS_DEFAULT;
            }
        } else {
            if (quickTags) quickTags.innerHTML = CHIPS_DEFAULT;
        }

        if (tituloRecom) tituloRecom.textContent = tituloSeccion;

        const res  = await fetch(url);
        const data = await res.json();
        if (!data.ok || !grid) return;

        grid.innerHTML = data.data.peliculas.map(p => `
    <div class="movie-item"
         onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}&media_type=${p.media_type || 'movie'}'"
         style="cursor:pointer; text-align:center;">
        <div class="movie-poster">
            <img src="${p.poster_url || ''}" alt="${p.titulo}" style="width:100%; border-radius:8px;">
        </div>
        <div style="text-align:center; margin-top:0.4rem;">
            ${getBadgeMedia(p)}
            <span class="movie-name" style="display:block; font-size:0.85rem; font-weight:600;">${p.titulo}</span>
            <span class="movie-year" style="display:block; font-size:0.75rem; color:#888;">${p.anio || ''}</span>
        </div>
    </div>
`).join('');

        // Stagger en recomendaciones
        grid.querySelectorAll('.movie-item').forEach((el, i) => {
            el.style.setProperty('--card-i', i);
        });

    } catch (err) {
        if (quickTags) quickTags.innerHTML = CHIPS_DEFAULT;
    }
});

// ── EFECTO TYPEWRITER en el título ────────────────────────────────────────────
(function () {
    const PALABRAS = [
        'descifrar',
        'analizar',
        'explorar',
        'descubrir',
        'interpretar',
        'ver más allá',
        'revelar',
    ];
    const PAUSA_PALABRA   = 2200;  // ms que permanece la palabra completa
    const VELOCIDAD_BORRAR  = 55;  // ms por letra al borrar  (rápido)
    const VELOCIDAD_ESCRIBIR = 95; // ms por letra al escribir (natural)

    let indice   = 0;
    let charIdx  = PALABRAS[0].length; // "descifrar" ya está visible en el HTML
    let borrando = true;               // empezamos borrando la palabra inicial

    function tick() {
        const el = document.getElementById('palabra-dinamica');
        if (!el) return;

        if (borrando) {
            charIdx--;
            el.textContent = PALABRAS[indice].substring(0, charIdx);

            if (charIdx === 0) {
                // Pasamos a la siguiente palabra y empezamos a escribir
                indice   = (indice + 1) % PALABRAS.length;
                borrando = false;
                setTimeout(tick, 180);
            } else {
                setTimeout(tick, VELOCIDAD_BORRAR);
            }
        } else {
            charIdx++;
            el.textContent = PALABRAS[indice].substring(0, charIdx);

            if (charIdx >= PALABRAS[indice].length) {
                // Palabra completa — pausar antes de borrar
                borrando = true;
                setTimeout(tick, PAUSA_PALABRA);
            } else {
                setTimeout(tick, VELOCIDAD_ESCRIBIR);
            }
        }
    }

    // Esperar un momento con "descifrar" visible antes de empezar el ciclo
    setTimeout(tick, PAUSA_PALABRA);
})();

// ── TYPEWRITER en el placeholder del input ────────────────────────────────────
(async function () {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const PLACEHOLDER_DEFAULT = 'Busca una película...';
    const PREFIJO             = 'Busca ';
    const VELOCIDAD_ESCRIBIR  = 80;   // ms por letra al escribir
    const VELOCIDAD_BORRAR    = 40;   // ms por letra al borrar
    const PAUSA_COMPLETA      = 2000; // ms con el título completo
    const PAUSA_INICIO        = 1200; // ms antes de empezar a escribir el título

    // Obtener títulos populares de la API
    let titulos = [];
    try {
        const res  = await fetch(`${API_URL}/peliculas/populares`);
        const data = await res.json();
        if (data.ok && data.data.peliculas?.length) {
            // Mezclar aleatoriamente y tomar 12
            titulos = data.data.peliculas
                .map(p => p.titulo)
                .sort(() => Math.random() - 0.5)
                .slice(0, 12);
        }
    } catch { /* si falla, no hay animación */ }

    if (!titulos.length) return;

    let indice    = 0;
    let charIdx   = 0;
    let borrando  = false;
    let activo    = true;
    let timeoutId = null;

    function setPlaceholder(texto) {
        input.placeholder = PREFIJO + texto + '...';
    }

    function resetPlaceholder() {
        input.placeholder = PLACEHOLDER_DEFAULT;
    }

    function tick() {
        if (!activo) return;

        const titulo = titulos[indice];

        if (!borrando) {
            // Escribir
            charIdx++;
            setPlaceholder(titulo.substring(0, charIdx));

            if (charIdx >= titulo.length) {
                borrando  = true;
                timeoutId = setTimeout(tick, PAUSA_COMPLETA);
            } else {
                timeoutId = setTimeout(tick, VELOCIDAD_ESCRIBIR);
            }
        } else {
            // Borrar
            charIdx--;
            setPlaceholder(titulo.substring(0, charIdx));

            if (charIdx === 0) {
                borrando = false;
                indice   = (indice + 1) % titulos.length;
                timeoutId = setTimeout(tick, PAUSA_INICIO);
            } else {
                timeoutId = setTimeout(tick, VELOCIDAD_BORRAR);
            }
        }
    }

    // Pausar al hacer foco, reanudar al salir si el input está vacío
    input.addEventListener('focus', () => {
        activo = false;
        clearTimeout(timeoutId);
        resetPlaceholder();
    });

    input.addEventListener('blur', () => {
        if (input.value.trim() !== '') return; // si hay texto, no reanudar
        activo    = true;
        charIdx   = 0;
        borrando  = false;
        timeoutId = setTimeout(tick, PAUSA_INICIO);
    });

    // Arrancar
    timeoutId = setTimeout(tick, 2800); // esperar a que la página cargue
})();