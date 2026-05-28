// ── MAGIC FILM — Script compartido entre páginas ──

function getToken() { return localStorage.getItem('mf_token'); }
function getUsuario() {
    const u = localStorage.getItem('mf_usuario');
    return u ? JSON.parse(u) : null;
}

// ── TEMA CLARO / OSCURO ───────────────────────────
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('mf_theme', tema);
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.innerHTML = tema === 'light'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
}

function toggleTheme() {
    const actual = document.documentElement.getAttribute('data-theme') || 'dark';
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
}

function inyectarToggleTema() {
    // Navbar principal (index, busqueda, analisis, perfil, admin)
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !navActions.querySelector('.theme-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.title = 'Cambiar tema';
        btn.onclick = toggleTheme;
        navActions.insertBefore(btn, navActions.firstChild);
    }
    // Navbar de auth (login, registro, onboarding)
    const loginNav = document.querySelector('.login-nav .login-nav-actions, .login-nav, .auth-nav');
    if (!navActions && loginNav && !loginNav.querySelector('.theme-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.title = 'Cambiar tema';
        btn.onclick = toggleTheme;
        loginNav.appendChild(btn);
    }
    // Aplicar icono correcto según tema actual
    const tema = document.documentElement.getAttribute('data-theme') || 'dark';
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.innerHTML = tema === 'light'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
}

function inyectarHamburger() {
    const navbar      = document.querySelector('.navbar');
    const navContainer = document.querySelector('.nav-container');
    const navLinks    = document.querySelector('.nav-links');
    if (!navbar || !navContainer || !navLinks) return;
    if (navContainer.querySelector('.nav-hamburger')) return;

    // Botón hamburger
    const hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Menú');
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    const navActions = navContainer.querySelector('.nav-actions');
    if (navActions) navContainer.insertBefore(hamburger, navActions);
    else navContainer.appendChild(hamburger);

    // Menú móvil — clona los links existentes
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-nav-menu';
    const clonedLinks = navLinks.cloneNode(true);
    mobileMenu.appendChild(clonedLinks);
    navbar.appendChild(mobileMenu);

    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('nav-open');
        document.body.classList.toggle('body-nav-open');
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navbar.classList.remove('nav-open');
            document.body.classList.remove('body-nav-open');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Restaurar tema guardado (el atributo ya fue aplicado por el inline script anti-flash,
    // aquí solo nos aseguramos de que el ícono quede correcto)
    const temaGuardado = localStorage.getItem('mf_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    inyectarToggleTema();
    inyectarHamburger();
});

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

    // Fondo degradado oscuro
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 70);
    grad.addColorStop(0, '#2a2a2a');
    grad.addColorStop(1, '#111111');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();

    // Borde dorado
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 64, 62, 0, Math.PI * 2);
    ctx.stroke();

    // Iniciales
    ctx.fillStyle = '#f5a623';
    ctx.font = 'bold 46px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iniciales, 64, 66);

    return canvas.toDataURL('image/png');
}

// ── NAVBAR AVATAR ─────────────────────────────────
function actualizarNavbarAvatar() {
    const usuario = getUsuario();
    const avatarImgs = document.querySelectorAll('.avatar img, #nav-avatar img, #nav-avatar-img');

    if (!usuario || !getToken()) {
        // Sin sesión — ocultar avatar y mostrar botón login
        const navActions = document.querySelector('.nav-actions');
        if (navActions && !navActions.querySelector('a')) {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.85rem;">
                    Iniciar sesión
                </a>
            `;
        }
        return;
    }

    // Con sesión — mostrar cache inmediatamente, luego sincronizar desde BD
    let fotoCache = localStorage.getItem(`foto_${usuario.id}`);
    if (fotoCache) {
        avatarImgs.forEach(img => { if (img) img.src = fotoCache; });
    }

    // Siempre sincronizar con BD para mantener el cache actualizado
    fetch('/api/usuarios/perfil', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    .then(r => r.json())
    .then(data => {
        if (!data.ok) return;
        const u = data.data.usuario;
        let fotoFinal;
        if (u.foto_perfil) {
            fotoFinal = u.foto_perfil;
            localStorage.setItem(`foto_${u.id}`, fotoFinal);
        } else if (!fotoCache) {
            fotoFinal = generarAvatarIniciales(u.nombre_completo || u.nombre_usuario);
            localStorage.setItem(`foto_${u.id}`, fotoFinal);
        }
        if (fotoFinal) {
            avatarImgs.forEach(img => { if (img) img.src = fotoFinal; });
        }
    })
    .catch(() => {
        // Sin red — usar cache o iniciales
        if (!fotoCache) {
            const fallback = generarAvatarIniciales(usuario.nombre_completo || usuario.nombre_usuario);
            avatarImgs.forEach(img => { if (img) img.src = fallback; });
        }
    });
}

document.addEventListener('DOMContentLoaded', actualizarNavbarAvatar);