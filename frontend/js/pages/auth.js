const API_URL = '/api';

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

// ── FORGOT PASSWORD ───────────────────────────
const linkForgot = document.querySelector('.field-forgot a');
if (linkForgot) {
  linkForgot.addEventListener('click', async (e) => {
    e.preventDefault();

    const emailPrefill = document.getElementById('login-email')?.value.trim() || '';

    const { value: email } = await Swal.fire({
      title: 'Recuperar contraseña',
      html: 'Ingresa tu correo y te enviaremos un enlace para restablecerla.',
      input: 'email',
      inputValue: emailPrefill,
      inputPlaceholder: 'tucorreo@ejemplo.com',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#f5a623',
      cancelButtonColor: '#333',
      showCancelButton: true,
      confirmButtonText: 'Enviar enlace',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => { if (!v) return 'Ingresa tu correo'; }
    });

    if (!email) return;

    Swal.fire({
      title: 'Enviando...',
      background: '#0a0a0a',
      color: '#ffffff',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: data.data?.mensaje || 'Si el correo está registrado, recibirás un enlace en breve.',
        background: '#0a0a0a',
        color: '#ffffff',
        iconColor: '#f5a623',
        confirmButtonColor: '#f5a623'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#f5a623'
      });
    }
  });
}

// ── GOOGLE AUTH CALLBACK ──────────────────────
window.handleGoogleResponse = async function(response) {
  Swal.fire({
    title: 'Conectando con Google...',
    background: '#0a0a0a',
    color: '#ffffff',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res  = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: response.credential })
    });
    const data = await res.json();

    if (data.ok) {
      setToken(data.data.token);
      setUsuario(data.data.usuario);

      Swal.fire({
        icon: 'success',
        title: `¡Bienvenido, ${data.data.usuario.nombre_usuario}!`,
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.error || 'No se pudo iniciar sesión con Google',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#f5a623'
      });
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#f5a623'
    });
  }
};

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

    // ── Paso 1: enviar código de verificación ──
    btnRegistro.disabled = true;
    btnRegistro.innerHTML = 'Enviando código... <i class="fas fa-circle-notch fa-spin"></i>';

    try {
      const resCodigo = await fetch(`${API_URL}/auth/enviar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const dataCodigo = await resCodigo.json();

      if (!dataCodigo.ok) {
        mostrarError('reg-error', dataCodigo.error || 'No se pudo enviar el código');
        btnRegistro.disabled = false;
        btnRegistro.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
        return;
      }
    } catch (err) {
      mostrarError('reg-error', 'Error de conexión con el servidor');
      btnRegistro.disabled = false;
      btnRegistro.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
      return;
    }

    // ── Paso 2: pedir el código al usuario ──
    const { value: codigo, isDismissed } = await Swal.fire({
      title: 'Verifica tu correo',
      html: `
        <div style="overflow:hidden;">
          <p style="color:#888;font-size:0.9rem;margin-bottom:1.2rem;">
            Enviamos un código de 6 dígitos a <strong style="color:#f5a623;">${email}</strong>.<br>
            Expira en 10 minutos.
          </p>
          <input id="swal-codigo" class="swal2-input" maxlength="6"
                 placeholder="------"
                 style="font-size:2rem;letter-spacing:0.5rem;text-align:center;font-weight:700;
                        width:100%;max-width:200px;box-sizing:border-box;display:block;margin:0 auto;">
        </div>
      `,
      background: '#0a0a0a',
      color: '#ffffff',
      confirmButtonColor: '#f5a623',
      cancelButtonColor: '#333',
      showCancelButton: true,
      confirmButtonText: 'Verificar',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'swal-overflow-hidden' },
      width: '360px',
      didOpen: () => {
        // Solo permitir dígitos
        document.getElementById('swal-codigo').addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '');
        });
        document.getElementById('swal-codigo').focus();
      },
      preConfirm: () => {
        const val = document.getElementById('swal-codigo').value.trim();
        if (val.length !== 6) {
          Swal.showValidationMessage('El código debe tener 6 dígitos');
          return false;
        }
        return val;
      }
    });

    if (isDismissed || !codigo) {
      btnRegistro.disabled = false;
      btnRegistro.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
      return;
    }

    // ── Paso 3: registrar con el código verificado ──
    Swal.fire({
      title: 'Creando tu cuenta...',
      background: '#0a0a0a',
      color: '#ffffff',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo, nombre_usuario, email, password, codigo })
      });
      const data = await res.json();

      if (data.ok) {
        setToken(data.data.token);
        setUsuario(data.data.usuario);
        Swal.close();
        window.location.href = 'onboarding.html';
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo completar el registro',
          background: '#0a0a0a',
          color: '#ffffff',
          confirmButtonColor: '#f5a623'
        });
        btnRegistro.disabled = false;
        btnRegistro.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#f5a623'
      });
      btnRegistro.disabled = false;
      btnRegistro.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
    }
  });
}