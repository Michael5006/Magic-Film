<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Playfair+Display&size=42&duration=3000&pause=1000&color=F5A623&center=true&vCenter=true&width=600&height=80&lines=Magic+Film;Analisis+Cinematografico+con+IA" alt="Magic Film" />

<br/>

**Plataforma web de análisis cinematográfico adaptativo impulsado por inteligencia artificial.**  
*Entiende el Verdadero Significado del Cine*

<br/>

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-f5a623?style=for-the-badge&logo=github)](https://github.com/Michael5006/Magic-Film)
[![Versión](https://img.shields.io/badge/Versión-0.2%20Backend%20+%20APIs-f5a623?style=for-the-badge)](https://github.com/Michael5006/Magic-Film)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-2ecc71?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Groq](https://img.shields.io/badge/Groq_IA-f5a623?style=for-the-badge)](https://console.groq.com)
<a href="https://magic-film.vercel.app" target="_blank"><img src="https://img.shields.io/badge/Demo-Ver%20en%20Vivo-black?style=for-the-badge&logo=vercel" alt="Demo"></a>

<br/>

📄 **[Ver Documentación Oficial (SRS v0.1)](docs/Documentacion.Magic-Film.pdf)**

<br/>

---

</div>

## ¿Qué es Magic Film?

Magic Film es una plataforma web que genera **análisis cinematográficos personalizados con inteligencia artificial**. A diferencia de IMDb o Letterboxd —que muestran reseñas escritas por usuarios con calidad inconsistente— Magic Film produce su propio análisis estructurado y adaptado al carácter de cada película.

El sistema detecta automáticamente si una película es de **entretenimiento masivo** o **cine de autor**, y genera un análisis completamente diferente para cada caso. Todo en español, organizado en capas temáticas, y guardado en base de datos para no repetir trabajo.

<br/>

## ¿Cómo funciona?
```
Usuario escribe "Midsommar"
        ↓
Frontend envía la búsqueda al backend
        ↓
Backend consulta TMDB → obtiene géneros, keywords, datos
        ↓
Clasificador interno → PROFUNDO o ENTRETENIMIENTO
        ↓
¿Análisis ya existe en BD?
   ├── SÍ → devuelve el guardado  (rápido, sin costo)
   └── NO → llama a Groq IA (Llama 3.3) → guarda → devuelve
        ↓
Frontend pinta las pantallas con el resultado
        ↓
YouTube Data API → muestra videos relacionados en la página
```

<br/>

## Tipos de análisis

| Modo | Películas objetivo | Contenido generado |
|------|-------------------|-------------------|
| **Entretenimiento** | Blockbusters, comedias, series | Resumen · Momentos épicos · Easter eggs · Curiosidades de producción |
| **Profundo** | Cine de autor, dramas, folk horror | Narrativa · Simbolismo · Contexto cultural · Técnica cinematográfica · Conclusión |

<br/>

## Stack tecnológico

<div align="center">

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5 · CSS3 · JavaScript ES6+ |
| **Backend** | Node.js · Express.js |
| **Base de datos** | MySQL 8.0 |
| **IA generativa** | Groq API — llama-3.3-70b-versatile |
| **Datos de películas** | TMDB API v3 |
| **Videos relacionados** | YouTube Data API v3 |
| **Autenticación** | JWT + bcryptjs |

</div>

<br/>

## Arquitectura del proyecto

El sistema sigue una arquitectura **MVC de 3 capas**. El frontend nunca se comunica directamente con TMDB, Groq ni YouTube — toda llamada pasa por el backend, protegiendo las API Keys.
```
Cliente (HTML/CSS/JS)  →  Backend API REST (Node.js/Express)  →  MySQL + APIs externas
```
```
MagicFilm/
├── backend/
│   ├── config/          → Configuración de DB y variables de entorno
│   ├── controllers/     → Lógica de negocio por entidad
│   ├── models/          → Acceso a la base de datos (consultas SQL)
│   ├── routes/          → Definición de endpoints REST
│   ├── middlewares/     → Auth JWT, adminOnly, validación
│   ├── services/        → Integración con TMDB, Groq IA, clasificador
│   ├── utils/           → Helpers de respuesta y manejo de errores
│   └── server.js        → Punto de entrada del servidor
│
├── frontend/
│   ├── pages/           → HTML de cada página separada
│   ├── css/
│   │   ├── pages/       → Estilos por página
│   │   └── components/  → Componentes reutilizables
│   ├── js/
│   │   ├── api/         → Clientes HTTP al backend
│   │   └── pages/       → Lógica JavaScript por página
│   └── assets/          → Imágenes y recursos
│
├── database/
│   ├── schema.sql       → 12 tablas en MySQL
│   ├── seeds/           → Datos de prueba
│   └── MER/             → Diagrama entidad-relación
│
├── docs/
│   └── Documentacion.Magic-Film.pdf
│
├── .env.example
└── README.md
```

<br/>

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
| POST | `/api/analisis/generar/:pelicula_id` | Generar análisis con Groq IA |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/perfil` | Perfil del usuario |
| GET | `/api/usuarios/favoritos` | Lista de favoritos |
| POST | `/api/usuarios/favoritos/:id` | Agregar a favoritos |
| DELETE | `/api/usuarios/favoritos/:id` | Eliminar de favoritos |
| POST | `/api/usuarios/onboarding` | Guardar géneros y nivel cinéfilo |
| GET | `/api/usuarios/generos` | Géneros favoritos del usuario |
| GET | `/api/usuarios/historial` | Historial de búsquedas |

<br/>

## Instalación y configuración

### Requisitos
- Node.js v18+
- MySQL 8.0
- Cuenta en TMDB — themoviedb.org/settings/api (gratuita)
- Cuenta en Groq — console.groq.com (gratuita)
- Cuenta en Google Cloud — YouTube Data API v3 (gratuita, 10,000 unidades/día)

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
```sql
CREATE DATABASE magic_filmv01 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

<br/>

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| **Invitado** | Buscar películas · Ver análisis existentes |
| **Registrado** | Todo lo anterior + Generar análisis · Guardar favoritos · Historial · Perfil personalizado |
| **Administrador** | Gestión completa de películas · Regenerar análisis · Panel de monitoreo |

<br/>

## Páginas del frontend

| Página | Descripción |
|--------|-------------|
| `index.html` | Inicio con películas populares dinámicas desde TMDB |
| `login.html` | Inicio de sesión con diseño cinematográfico animado |
| `registro.html` | Crear cuenta — paso 1 de 2 |
| `onboarding.html` | Configurar perfil — géneros favoritos y nivel cinéfilo |
| `busqueda.html` | Buscador con filtros por género en tiempo real |
| `analisis.html` | Análisis generado por IA en modo profundo o entretenimiento con videos de YouTube |
| `perfil.html` | Perfil editable con favoritos, géneros e historial de búsquedas |

<br/>

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Diseño UI/UX completo | ✅ Completado |
| 2 | Mockup interactivo HTML/CSS/JS | ✅ Completado |
| 3 | Flujo de registro, login y configuración de perfil | ✅ Completado |
| 4 | Backend Node.js + Express + MySQL | ✅ Completado |
| 5 | Integración TMDB API | ✅ Completado |
| 6 | Integración Groq IA (Llama 3.3) | ✅ Completado |
| 7 | Base de datos MySQL — 12 tablas | ✅ Completado |
| 8 | Conexión frontend con backend real | ✅ Completado |
| 9 | YouTube Data API integrada | ✅ Completado |
| 10 | Despliegue en producción | ⏳ Pendiente |

<br/>

## Documentación

El proyecto cuenta con una especificación formal de requisitos que incluye objetivos del sistema, requisitos funcionales y no funcionales, historias de usuario y diagrama de casos de uso.

<div align="center">

📄 **[Descargar Documentación SRS v0.1 — Magic Film](docs/Documentacion.Magic-Film.pdf)**

</div>

<br/>

## Equipo

<div align="center">

| | Integrante |
|--|------------|
| 👨‍💻 | Luis Enrique Riascos Palacios |
| 👨‍💻 | Yennifer Salas Ibarra |
| 👨‍💻 | Michael Camilo Marín Hernández |

**Docente:** Ana María Caviedes  
**Institución:** Corporación Universitaria Autónoma del Cauca  
**Programa:** Ingeniería de Software y Computación — Popayán, Cauca

</div>

<br/>

---

<div align="center">

*Magic Film — Análisis cinematográfico adaptativo · v0.2 · 2026*

</div>