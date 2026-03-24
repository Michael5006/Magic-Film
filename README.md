# 🎬 Magic Film

**Plataforma web de análisis cinematográfico adaptativo con Inteligencia Artificial**

> Versión 0.2 — Marzo 2026  
> Desarrollado por Michael Hernández · Yennifer Salas · Luis Riascos  
> Universidad Autónoma de Colombia · Ingeniería de Software II

---

## ¿Qué es Magic Film?

Magic Film es una plataforma web que genera análisis cinematográficos personalizados usando inteligencia artificial. A diferencia de IMDb o Letterboxd, Magic Film no muestra reseñas de otros usuarios — genera su propio análisis adaptado al tipo de cada película.

El sistema clasifica automáticamente cada película en dos modos:

- **PROFUNDO** — Para cine de autor, con análisis de narrativa, simbolismo, contexto, técnica y conclusión
- **ENTRETENIMIENTO** — Para cine comercial, con resumen, momentos épicos, easter eggs y curiosidades

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 · CSS3 · JavaScript Vanilla |
| Backend | Node.js · Express.js |
| Base de datos | MySQL 8.0 |
| IA generativa | Groq API (llama-3.3-70b-versatile) |
| Datos de películas | TMDB API v3 |
| Videos relacionados | YouTube Data API v3 |
| Autenticación | JWT + bcryptjs |

---

## Estructura del Proyecto
```
MagicFilm/
├── backend/
│   ├── config/          ← Conexión BD y variables de entorno
│   ├── controllers/     ← Lógica de negocio
│   ├── middlewares/     ← Auth JWT y validaciones
│   ├── models/          ← Consultas a MySQL
│   ├── routes/          ← Endpoints de la API
│   ├── services/        ← TMDB, Groq IA, Clasificador
│   ├── utils/           ← Helpers de respuesta y errores
│   └── server.js        ← Punto de entrada
├── frontend/
│   ├── pages/           ← HTML de cada página
│   ├── css/             ← Estilos por página
│   ├── js/
│   │   ├── api/         ← Clientes HTTP
│   │   └── pages/       ← Lógica de cada página
│   └── assets/          ← Imágenes
├── database/
│   ├── schema.sql       ← 12 tablas en MySQL
│   └── seeds/           ← Datos de prueba
└── docs/                ← Documentación del proyecto
```

---

## Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Crear cuenta nueva |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |

### Películas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/peliculas/buscar?q=` | Buscar por título en TMDB |
| GET | `/api/peliculas/populares` | Películas populares de la semana |
| GET | `/api/peliculas/genero/:id` | Filtrar por género TMDB |
| GET | `/api/peliculas/youtube/:tmdb_id` | Videos relacionados en YouTube |
| GET | `/api/peliculas/:tmdb_id` | Detalles completos de una película |

### Análisis
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/analisis/:pelicula_id` | Obtener análisis existente |
| POST | `/api/analisis/generar/:pelicula_id` | Generar análisis con IA |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/perfil` | Perfil del usuario |
| GET | `/api/usuarios/favoritos` | Lista de favoritos |
| POST | `/api/usuarios/favoritos/:id` | Agregar a favoritos |
| DELETE | `/api/usuarios/favoritos/:id` | Eliminar de favoritos |
| POST | `/api/usuarios/onboarding` | Guardar géneros y nivel |
| GET | `/api/usuarios/generos` | Géneros favoritos del usuario |
| GET | `/api/usuarios/historial` | Historial de búsquedas |

---

## Instalación y Configuración

### Requisitos
- Node.js v18+
- MySQL 8.0
- Cuenta en TMDB (API Key gratuita)
- Cuenta en Groq (API Key gratuita)
- Cuenta en Google Cloud (YouTube Data API v3 gratuita)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/Michael5006/Magic-Film.git
cd Magic-Film
```

**2. Instalar dependencias del backend**
```bash
cd backend
npm install
```

**3. Configurar variables de entorno**

Crear `backend/.env` basándose en `.env.example`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=magic_filmv01
DB_USER=root
DB_PASSWORD=tu_contraseña

TMDB_API_KEY=tu_key_de_tmdb
TMDB_BASE_URL=https://api.themoviedb.org/3

GROQ_API_KEY=tu_key_de_groq
GROQ_MODEL=llama-3.3-70b-versatile

YOUTUBE_API_KEY=tu_key_de_youtube

JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=7d
```

**4. Crear la base de datos**
```bash
mysql -u root -p
CREATE DATABASE magic_filmv01 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

**5. Cargar el schema**
```bash
Get-Content database/schema.sql | mysql -u root -p magic_filmv01
```

**6. Ejecutar el servidor**
```bash
cd backend
npm run dev
```

**7. Abrir el frontend**

Abrir `frontend/pages/index.html` con Live Server en VS Code.

---

## Flujo de uso
```
1. Usuario se registra → onboarding (elige 3 géneros + nivel)
2. Busca una película por nombre o filtra por género
3. El sistema consulta TMDB para obtener datos y keywords
4. El Clasificador analiza keywords → decide PROFUNDO o ENTRETENIMIENTO
5. Groq IA genera el análisis estructurado en capas
6. El análisis se guarda en BD (no se repite para el mismo usuario)
7. Se muestran videos relacionados de YouTube según el tipo
8. El usuario puede guardar en favoritos
```

---

## Páginas del Frontend

| Página | Descripción |
|--------|-------------|
| `index.html` | Inicio con películas populares dinámicas desde TMDB |
| `login.html` | Inicio de sesión con diseño cinematográfico |
| `registro.html` | Crear cuenta (paso 1 de 2) |
| `onboarding.html` | Configurar perfil — géneros y nivel cinéfilo |
| `busqueda.html` | Buscador con filtros por género en tiempo real |
| `analisis.html` | Análisis generado por IA en modo profundo o entretenimiento |
| `perfil.html` | Perfil con favoritos, géneros, historial y edición |

---

## Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| v0.1 | Febrero 2026 | Mockup frontend estático con datos simulados |
| v0.2 | Marzo 2026 | Backend completo + frontend conectado con APIs reales |

---

## APIs Externas Utilizadas

- **TMDB** — themoviedb.org/settings/api — Gratuita para uso educativo
- **Groq** — console.groq.com — Gratuita con límites generosos
- **YouTube Data API v3** — console.cloud.google.com — Gratuita (10,000 unidades/día)

---

*Magic Film — Entiende el verdadero significado del cine*