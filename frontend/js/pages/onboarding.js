const API_URL = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('mf_token'); }

// Verificar que haya sesión activa
if (!getToken()) {
  window.location.href = 'login.html';
}

let generosSeleccionados = [];
let nivelSeleccionado = 'entusiasta';

function toggleGenre(el) {
  const id = parseInt(el.dataset.id);

  if (el.classList.contains('active')) {
    el.classList.remove('active');
    generosSeleccionados = generosSeleccionados.filter(g => g !== id);
  } else {
    if (generosSeleccionados.length >= 3) {
      mostrarError('onb-error', 'Solo puedes seleccionar 3 géneros');
      return;
    }
    el.classList.add('active');
    generosSeleccionados.push(id);
  }
}

function selectLevel(el, nivel) {
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  nivelSeleccionado = nivel;
}

function mostrarError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// Botón completar onboarding
document.getElementById('btn-onboarding').addEventListener('click', async () => {
  if (generosSeleccionados.length !== 3) {
    mostrarError('onb-error', 'Debes seleccionar exactamente 3 géneros');
    return;
  }

  const btn = document.getElementById('btn-onboarding');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const res = await fetch(`${API_URL}/usuarios/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ generos: generosSeleccionados, nivel_cinefilo: nivelSeleccionado })
    });
    const data = await res.json();

    if (data.ok) {
      // Actualizar usuario en localStorage
      const usuario = JSON.parse(localStorage.getItem('mf_usuario') || '{}');
      usuario.onboarding_completo = 1;
      localStorage.setItem('mf_usuario', JSON.stringify(usuario));
      window.location.href = 'busqueda.html';
    } else {
      mostrarError('onb-error', data.error || 'Error al guardar preferencias');
      btn.disabled = false;
      btn.textContent = 'COMENZAR MI VIAJE CINEMATOGRÁFICO';
    }
  } catch (err) {
    mostrarError('onb-error', 'Error de conexión con el servidor');
    btn.disabled = false;
    btn.textContent = 'COMENZAR MI VIAJE CINEMATOGRÁFICO';
  }
});