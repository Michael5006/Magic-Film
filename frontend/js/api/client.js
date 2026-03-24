const API_URL = 'http://localhost:3000/api';

const client = {

  // Obtener token guardado
  getToken() {
    return localStorage.getItem('mf_token');
  },

  // Guardar token
  setToken(token) {
    localStorage.setItem('mf_token', token);
  },

  // Eliminar token
  removeToken() {
    localStorage.removeItem('mf_token');
    localStorage.removeItem('mf_usuario');
  },

  // Guardar usuario
  setUsuario(usuario) {
    localStorage.setItem('mf_usuario', JSON.stringify(usuario));
  },

  // Obtener usuario guardado
  getUsuario() {
    const u = localStorage.getItem('mf_usuario');
    return u ? JSON.parse(u) : null;
  },

  // Verificar si está logueado
  estaLogueado() {
    return !!this.getToken();
  },

  // Petición GET
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    return res.json();
  },

  // Petición POST
  async post(endpoint, datos) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(datos)
    });
    return res.json();
  },

  // Petición DELETE
  async delete(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    return res.json();
  }

};