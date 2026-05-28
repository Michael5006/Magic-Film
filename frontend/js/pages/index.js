const API_URL = '/api';

// Cambiar botones si hay sesión activa
if (localStorage.getItem('mf_token')) {
    const homeButtons = document.querySelector('.home-buttons');
    if (homeButtons) {
        homeButtons.innerHTML = `
            <button class="btn btn-primary" onclick="window.location.href='busqueda.html'">
                <span>Explorar Películas</span>
                <i class="fas fa-search"></i>
            </button>
            <button class="btn btn-secondary" onclick="window.location.href='perfil.html'">
                Mi Perfil
            </button>
        `;
    }
}

// ── Estado ────────────────────────────────────────────────────────────────────
const SLIDES = [
    { label: '<i class="fas fa-fire"></i> Populares esta semana',   data: null },
    { label: '<i class="fas fa-clock"></i> Generados recientemente', data: null }
];

let currentSlide = 0;   // qué dataset se muestra
let cardIndex    = [0, 0]; // página actual por dataset

let datasetTimer = null; // cambia de dataset cada 30s
let cardTimer    = null; // rota cards cada 20s

const DATASET_INTERVAL = 30000; // 30 seg
const CARD_INTERVAL    = 20000; // 20 seg
const PAGE_SIZE        = 4;

// ── Renderizar cards ──────────────────────────────────────────────────────────
function getPage(slideIndex) {
    const pool  = SLIDES[slideIndex].data || [];
    const start = cardIndex[slideIndex] % pool.length;
    // Tomamos PAGE_SIZE películas rotando circularmente
    const items = [];
    for (let i = 0; i < PAGE_SIZE && i < pool.length; i++) {
        items.push(pool[(start + i) % pool.length]);
    }
    return items;
}

function renderCards(peliculas, direction = 'none') {
    const container = document.getElementById('movie-cards-home');
    if (!container) return;

    const html = peliculas.map((p, i) => `
        <div class="movie-card card-${i + 1}"
             onclick="window.location.href='analisis.html?tmdb_id=${p.tmdb_id}&media_type=${p.media_type || 'movie'}'"
             style="cursor:pointer;">
            <img src="${p.poster_url || ''}" alt="${p.titulo}">
            <div class="card-grain"></div>
            <div class="card-overlay">
                <span class="card-badge ${p.tipo_analisis === 'profundo' ? 'profundo' : 'entertainment'}">
                    <i class="fas ${p.tipo_analisis === 'profundo' ? 'fa-brain' : 'fa-bolt'}"></i>
                    ${p.tipo_analisis === 'profundo' ? 'PROFUNDO' : 'ENTRETENIMIENTO'}
                </span>
                <div class="card-info">
                    <div class="card-meta-row">
                        <span class="card-year">${p.anio || ''}</span>
                    </div>
                    <h4 class="card-movie-title">${p.titulo}</h4>
                    <div class="card-bottom-row">
                        <div class="card-score">
                            <i class="fas fa-star"></i>
                            ${p.calificacion ? parseFloat(p.calificacion).toFixed(1) : '-'}
                        </div>
                        <div class="card-cta">Ver análisis <i class="fas fa-arrow-right"></i></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Clase de dirección para el slide
    const outClass = direction === 'left'  ? 'cards-slide-out-left'
                   : direction === 'right' ? 'cards-slide-out-right'
                   : 'cards-fade-out';
    const inClass  = direction === 'left'  ? 'cards-slide-in-right'
                   : direction === 'right' ? 'cards-slide-in-left'
                   : 'cards-fade-in';

    container.classList.add(outClass);
    setTimeout(() => {
        container.innerHTML = html;
        container.classList.remove(outClass);
        container.classList.add(inClass);
        setTimeout(() => container.classList.remove(inClass), 400);
    }, 280);
}

// ── Actualizar label y dots ───────────────────────────────────────────────────
function updateHeader() {
    const label = document.getElementById('cards-panel-label');
    if (label) label.innerHTML = SLIDES[currentSlide].label;

    document.querySelectorAll('.cards-dot').forEach(d => {
        d.classList.toggle('active', parseInt(d.dataset.index) === currentSlide);
    });
}

// ── Rotar cards dentro del dataset actual ─────────────────────────────────────
function nextCards(direction = 'left') {
    if (!SLIDES[currentSlide].data) return;
    cardIndex[currentSlide] = (cardIndex[currentSlide] + PAGE_SIZE) % SLIDES[currentSlide].data.length;
    renderCards(getPage(currentSlide), direction);
}

// ── Cambiar dataset ───────────────────────────────────────────────────────────
function nextDataset() {
    const next = (currentSlide + 1) % SLIDES.length;
    if (!SLIDES[next].data) return;
    currentSlide = next;
    updateHeader();
    renderCards(getPage(currentSlide), 'left');
    resetCardTimer(); // reinicia el timer de cards al cambiar dataset
}

// ── Navegación manual ─────────────────────────────────────────────────────────
function switchCardsManual(dir) {
    const next = (currentSlide + dir + SLIDES.length) % SLIDES.length;
    if (!SLIDES[next].data) return;
    currentSlide = next;
    updateHeader();
    renderCards(getPage(currentSlide), dir > 0 ? 'left' : 'right');
    resetDatasetTimer();
    resetCardTimer();
}

// ── Timers ────────────────────────────────────────────────────────────────────
function resetDatasetTimer() {
    clearInterval(datasetTimer);
    if (SLIDES[1].data) {
        datasetTimer = setInterval(nextDataset, DATASET_INTERVAL);
    }
}

function resetCardTimer() {
    clearInterval(cardTimer);
    if (SLIDES[currentSlide].data?.length > PAGE_SIZE) {
        cardTimer = setInterval(() => nextCards('left'), CARD_INTERVAL);
    }
}

// ── Carga de datos ────────────────────────────────────────────────────────────
async function cargarPeliculasHome() {
    try {
        const res  = await fetch(`${API_URL}/peliculas/populares`);
        const data = await res.json();
        if (!data.ok || !data.data.peliculas.length) return;
        SLIDES[0].data = data.data.peliculas;
        renderCards(getPage(0));
    } catch (_) {}
}

async function cargarRecientes() {
    try {
        const res  = await fetch(`${API_URL}/peliculas/recientes`);
        const data = await res.json();
        if (!data.ok || !data.data.peliculas.length) return;
        SLIDES[1].data = data.data.peliculas;

        // Mostrar nav solo si hay recientes
        const nav = document.querySelector('.cards-panel-nav');
        if (nav) nav.style.display = 'flex';
    } catch (_) {}
}

async function cargarComunidad() {
    try {
        const res  = await fetch(`${API_URL}/usuarios/comunidad`);
        const data = await res.json();
        if (!data.ok) return;
        const { total, recientes } = data.data;

        const countEl = document.getElementById('home-user-count');
        if (countEl) {
            countEl.textContent = total >= 1000
                ? `+${(total / 1000).toFixed(total % 1000 === 0 ? 0 : 1)}K`
                : `+${total}`;
        }
        const avatarsEl = document.getElementById('home-avatars');
        if (avatarsEl && recientes.length > 0) {
            avatarsEl.innerHTML = recientes.map(u => {
                const nombre = u.nombre_completo || u.nombre_usuario;
                const foto   = localStorage.getItem(`foto_${u.id}`) || generarAvatarIniciales(nombre);
                return `<img src="${foto}" alt="cinéfilo">`;
            }).join('');
        }
    } catch (_) {}
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Ocultar nav hasta confirmar que hay recientes
    const nav = document.querySelector('.cards-panel-nav');
    if (nav) nav.style.display = 'none';

    await cargarPeliculasHome();
    await cargarRecientes();
    cargarComunidad();

    resetDatasetTimer(); // dataset cada 30s
    resetCardTimer();    // cards cada 20s

    initHeroParallax();
    initDustParticles();
});

// ── Hero dust — partículas doradas flotando (canvas) ──────────────────────────
function initDustParticles() {
    const canvas = document.querySelector('.home-bg-gradient .dust-particles');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const host = canvas.parentElement;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const COUNT = 40;
    let particles = [];

    function resize() {
        const w = host.clientWidth;
        const h = host.clientHeight;
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawn(initial) {
        const h = host.clientHeight;
        return {
            x: Math.random() * host.clientWidth,
            y: initial ? Math.random() * h : h + 10,
            r: 0.6 + Math.random() * 2.4,
            vy: -(0.15 + Math.random() * 0.55),
            vx: (Math.random() - 0.5) * 0.25,
            alpha: 0.15 + Math.random() * 0.55,
            tw: 0.01 + Math.random() * 0.03,
            ph: Math.random() * Math.PI * 2
        };
    }

    function init() {
        particles = [];
        for (let i = 0; i < COUNT; i++) particles.push(spawn(true));
    }

    function frame() {
        const w = host.clientWidth;
        const h = host.clientHeight;
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.y += p.vy;
            p.x += p.vx;
            p.ph += p.tw;

            if (p.y < -10 || p.x < -10 || p.x > w + 10) {
                Object.assign(p, spawn(false));
                continue;
            }

            const a = p.alpha * (0.55 + 0.45 * Math.sin(p.ph));
            const R = p.r * 3;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
            g.addColorStop(0, `rgba(255, 220, 150, ${a.toFixed(3)})`);
            g.addColorStop(1, 'rgba(255, 220, 150, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(frame);
    }

    resize();
    init();
    frame();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); init(); }, 150);
    });
}

// ── Hero parallax — los orbes siguen suavemente al mouse ──────────────────────
function initHeroParallax() {
    const orbs = document.querySelectorAll('.home-bg-gradient .orb');
    if (!orbs.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const DEPTHS = [14, 22, 9]; // px máx por orbe (más profundo = mayor desplazamiento)
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let rafId = null;

    function onMove(e) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) / cx;   // -1..1
        targetY = (e.clientY - cy) / cy;
        if (!rafId) rafId = requestAnimationFrame(update);
    }

    function update() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        orbs.forEach((orb, i) => {
            const depth = DEPTHS[i] || 10;
            orb.style.setProperty('--px', (currentX * depth).toFixed(2) + 'px');
            orb.style.setProperty('--py', (currentY * depth).toFixed(2) + 'px');
        });

        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            rafId = requestAnimationFrame(update);
        } else {
            rafId = null;
        }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
}
