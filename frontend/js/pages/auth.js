const API_URL = 'https://magic-film-api.onrender.com/api';

function getToken() { return localStorage.getItem('mf_token'); }
function setToken(t) { localStorage.setItem('mf_token', t); }
function setUsuario(u) { localStorage.setItem('mf_usuario', JSON.stringify(u)); }

function mostrarError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ── MOSTRAR/OCULTAR CONTRASEÑA ─────────────────
window.togglePassword = function(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById('eye-' + inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
};

// ── FUERZA DE CONTRASEÑA ──────────────────────
window.checkPasswordStrength = function(value) {
  const bar = document.getElementById('strength-bar');
  if (!bar) return;
  let strength = 0;
  if (value.length >= 6)  strength += 25;
  if (value.length >= 10) strength += 25;
  if (/[A-Z]/.test(value) || /[0-9]/.test(value)) strength += 25;
  if (/[^A-Za-z0-9]/.test(value)) strength += 25;
  const colors = { 25:'#e74c3c', 50:'#e67e22', 75:'#f1c40f', 100:'#2ecc71' };
  bar.style.width = strength + '%';
  bar.style.background = colors[strength] || '#e74c3c';
};

// ── LOGIN ──────────────────────────────────────
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      mostrarError('login-error', 'Email y contraseña son obligatorios');
      return;
    }

    // SweetAlert de carga
    Swal.fire({
      title: 'Entrando...',
      html: 'Preparando tu experiencia cinematográfica',
      background: '#0a0a0a',
      color: '#ffffff',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'swal-cinema' }
    });

    btnLogin.disabled = true;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.ok) {
        setToken(data.data.token);
        setUsuario(data.data.usuario);

        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${data.data.usuario.nombre_usuario}!`,
          html: 'Tu viaje cinematográfico continúa',
          background: '#0a0a0a',
          color: '#ffffff',
          iconColor: '#f5a623',
          confirmButtonColor: '#f5a623',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          if (!data.data.usuario.onboarding_completo) {
            window.location.href = 'onboarding.html';
          } else {
            window.location.href = 'busqueda.html';
          }
        });

      } else {
        Swal.close();
        mostrarError('login-error', data.error || 'Credenciales incorrectas');
        btnLogin.disabled = false;
      }
    } catch (err) {
      Swal.close();
      mostrarError('login-error', 'Error de conexión con el servidor');
      btnLogin.disabled = false;
    }
  });
}

// ── REGISTRO ───────────────────────────────────
const btnRegistro = document.getElementById('btn-registro');
if (btnRegistro) {
  btnRegistro.addEventListener('click', async () => {
    const nombre_completo = document.getElementById('reg-name').value.trim();
    const nombre_usuario  = document.getElementById('reg-username').value.trim();
    const email           = document.getElementById('reg-email').value.trim();
    const password        = document.getElementById('reg-password').value;
    const confirm         = document.getElementById('reg-confirm').value;

    if (!nombre_usuario || !email || !password) {
      mostrarError('reg-error', 'Todos los campos son obligatorios');
      return;
    }
    if (password.length < 6) {
      mostrarError('reg-error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      mostrarError('reg-error', 'Las contraseñas no coinciden');
      return;
    }

    btnRegistro.disabled = true;
    btnRegistro.textContent = 'Creando cuenta...';

    try {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo, nombre_usuario, email, password })
      });
      const data = await res.json();

      if (data.ok) {
        setToken(data.data.token);
        setUsuario(data.data.usuario);
        window.location.href = 'onboarding.html';
      } else {
        mostrarError('reg-error', data.error || 'Error al registrar');
        btnRegistro.disabled = false;
        btnRegistro.innerHTML = 'CONTINUAR <i class="fas fa-arrow-right"></i>';
      }
    } catch (err) {
      mostrarError('reg-error', 'Error de conexión con el servidor');
      btnRegistro.disabled = false;
      btnRegistro.innerHTML = 'CONTINUAR <i class="fas fa-arrow-right"></i>';
    }
  });
}