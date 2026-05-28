<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Playfair+Display&size=42&duration=3000&pause=1000&color=F5A623&center=true&vCenter=true&width=600&height=80&lines=Magic+Film;Analisis+Cinematografico+con+IA" alt="Magic Film" />

<br/>

**Plataforma web de análisis cinematográfico adaptativo impulsado por inteligencia artificial.**  
*Entiende el Verdadero Significado del Cine*

<br/>

[![Estado](https://img.shields.io/badge/Estado-V1.0%20Estable-2ecc71?style=for-the-badge&logo=github)](https://github.com/Michael5006/Magic-Film)
[![Versión](https://img.shields.io/badge/Versión-1.0-f5a623?style=for-the-badge)](https://github.com/Michael5006/Magic-Film)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-2ecc71?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Groq](https://img.shields.io/badge/Groq_IA-f5a623?style=for-the-badge)](https://console.groq.com)
<a href="https://magic-film-frontend.onrender.com/pages/index.html" target="_blank"><img src="https://img.shields.io/badge/Demo-Ver%20en%20Vivo-black?style=for-the-badge&logo=vercel" alt="Demo"></a>

<br/>

📄 **[Documentación SRS v0.1](docs/Documentacion.Magic-Film.pdf)** · 📄 **[Manual Técnico v1.0](docs/Manual_Tecnico_Magic_Film.docx)**

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
| **Autenticación** | JWT + bcryptjs + Google OAuth 2.0 |
| **Email** | Nodemailer (Gmail SMTP) |

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
│   ├── controllers/     → Lógica de negocio (auth, peliculas, analisis, usuarios, admin)
│   ├── models/          → Acceso a la base de datos (7 modelos)
│   ├── routes/          → Definición de endpoints REST
│   ├── middlewares/     → Auth JWT, adminOnly, validación de input
│   ├── services/        → Integración con TMDB, Groq IA, clasificador, email
│   ├── utils/           → Helpers de respuesta y manejo de errores
│   └── server.js        → Punto de entrada del servidor
│
├── frontend/
│   ├── pages/           → 14 páginas HTML
│   ├── css/
│   │   ├── pages/       → Estilos por página
│   │   └── components/  → Componentes reutilizables (buttons, cards, forms, modal, navbar, tabs)
│   ├── js/
│   │   ├── api/         → Clientes HTTP al backend
│   │   ├── components/  → Componentes JS (loader, modal, navbar, tabs)
│   │   └── pages/       → Lógica JavaScript por página
│   └── assets/          → Favicon y recursos
│
├── database/
│   ├── schema.sql       → 11 tablas en MySQL
│   └── seeds/           → Datos de prueba
│
├── docs/
│   ├── Documentacion.Magic-Film.pdf   → SRS v0.1
│   └── Manual_Tecnico_Magic_Film.docx → Manual técnico v1.0
│
└── README.md
```

<br/>

## Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/enviar-codigo` | Enviar código de verificación al email |
| POST | `/api/auth/registro` | Crear cuenta con código verificado |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/google` | Autenticación con Google OAuth |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token |
| GET | `/api/auth/verificar-email` | Verificar correo electrónico |
| GET | `/api/auth/me` | Obtener usuario autenticado |

### Películas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/peliculas/buscar?q=` | Buscar por título en TMDB (multi-media) |
| GET | `/api/peliculas/populares` | Películas populares de la semana |
| GET | `/api/peliculas/genero/:id` | Filtrar por género TMDB (inc. K-Drama id=99) |
| GET | `/api/peliculas/youtube/:tmdb_id` | Videos relacionados en YouTube |
| GET | `/api/peliculas/:tmdb_id` | Detalles completos de una película |
| GET | `/api/peliculas/posters-fondo` | Pósters para fondos animados |

### Análisis
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/analisis/:pelicula_id` | Obtener análisis existente |
| POST | `/api/analisis/generar/:pelicula_id` | Generar análisis con Groq IA |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/perfil` | Perfil del usuario |
| PUT | `/api/usuarios/perfil` | Actualizar perfil (foto, bio, nivel) |
| GET | `/api/usuarios/favoritos` | Lista de favoritos |
| POST | `/api/usuarios/favoritos/:id` | Agregar a favoritos |
| DELETE | `/api/usuarios/favoritos/:id` | Eliminar de favoritos |
| POST | `/api/usuarios/onboarding` | Guardar géneros y nivel cinéfilo |
| GET | `/api/usuarios/generos` | Géneros favoritos del usuario |
| GET | `/api/usuarios/historial` | Historial de búsquedas |
| DELETE | `/api/usuarios/historial` | Limpiar historial |
| GET | `/api/usuarios/comunidad` | Explorar perfiles de otros usuarios |

### Administración
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Estadísticas generales del sistema |
| GET | `/api/admin/usuarios` | Listar todos los usuarios |
| PUT | `/api/admin/usuarios/:id/rol` | Cambiar rol de usuario |
| DELETE | `/api/admin/usuarios/:id` | Eliminar usuario |
| GET | `/api/admin/peliculas` | Listar películas del sistema |
| DELETE | `/api/admin/peliculas/:id` | Eliminar película y análisis |
| POST | `/api/admin/analisis/:id/regenerar` | Regenerar análisis con IA |
| GET | `/api/admin/historial` | Historial de acciones admin |

### Contacto
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/contacto` | Enviar mensaje de contacto por email |

<br/>

## Instalación y configuración

### Requisitos
- Node.js v18+
- MySQL 8.0
- Cuenta en TMDB — themoviedb.org/settings/api (gratuita)
- Cuenta en Groq — console.groq.com (gratuita)
- Cuenta en Google Cloud — YouTube Data API v3 + OAuth 2.0 (gratuita)

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

Crear `backend/.env`:
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

EMAIL_USER=magicfilm001@gmail.com
EMAIL_PASS=tu_app_password_gmail

GOOGLE_CLIENT_ID=tu_google_client_id

APP_URL=http://localhost:3000
```

**4. Crear la base de datos**
```sql
CREATE DATABASE magic_filmv01 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**5. Cargar el schema**
```bash
mysql -u root -p magic_filmv01 < database/schema.sql
```

**6. Ejecutar el servidor**
```bash
cd backend
npm run dev     # Desarrollo (con nodemon)
npm start       # Producción
```

**7. Acceder a la aplicación**

Abrir http://localhost:3000 en el navegador.

<br/>

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| **Invitado** | Buscar películas · Ver análisis existentes |
| **Registrado** | Todo lo anterior + Generar análisis · Guardar favoritos · Historial · Perfil personalizado |
| **Administrador** | Gestión completa de películas · Regenerar análisis · CRUD de usuarios · Panel de estadísticas |

<br/>

## Páginas del frontend

| Página | Descripción |
|--------|-------------|
| `index.html` | Landing page con hero animado y películas populares desde TMDB |
| `login.html` | Inicio de sesión con email/contraseña o Google OAuth |
| `registro.html` | Registro con verificación por código de 6 dígitos o Google |
| `onboarding.html` | Configurar perfil — nivel cinéfilo y 3 géneros favoritos (inc. K-Drama) |
| `busqueda.html` | Buscador con filtros por género, recomendaciones personalizadas y categorías |
| `analisis.html` | Análisis generado por IA con pestañas navegables, detalles y favoritos |
| `perfil.html` | Perfil editable con foto, bio, géneros, favoritos e historial |
| `admin.html` | Panel de administración con dashboard y gestión completa |
| `contacto.html` | Formulario de contacto funcional con envío real de email |
| `sobre-nosotros.html` | Información del equipo y proyecto |
| `privacidad.html` | Política de privacidad |
| `404.html` | Página de error personalizada |
| `verificar-email.html` | Confirmación de correo electrónico |
| `reset-password.html` | Restablecimiento de contraseña |

<br/>

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Diseño UI/UX completo (dark + light mode) | Completado |
| 2 | Frontend completo — 14 pantallas responsivas | Completado |
| 3 | Autenticación completa (email, Google OAuth, reset password) | Completado |
| 4 | Backend Node.js + Express + MySQL | Completado |
| 5 | Integración TMDB API (búsqueda multi-media, géneros, detalles) | Completado |
| 6 | Integración Groq IA — LLaMA 3.3 70B | Completado |
| 7 | Base de datos MySQL — 11 tablas normalizadas | Completado |
| 8 | Conexión frontend-backend completa | Completado |
| 9 | YouTube Data API integrada | Completado |
| 10 | Panel de administración | Completado |
| 11 | Sistema de email (verificación, contacto, reset) | Completado |
| 12 | Género K-Drama con búsqueda especializada | Completado |
| 13 | Manual técnico y documentación v1.0 | Completado |

<br/>

## Documentación

<div align="center">

📄 **[Documentación SRS v1.0 — Magic Film](docs/Documentacion.Magic-Film.pdf)**  
📄 **[Manual Técnico v1.0 — Magic Film](docs/Manual_Tecnico_Magic_Film.pdf)**
📄 **[Manual Usuario v1.0 — Magic Film](docs/Manual_De_Usuario_Magic_Film.pdf)**

</div>

<br/>

## Equipo

<div align="center">

| | Integrante |
|--|------------|
| | Luis Enrique Riascos Palacios |
| | Yennifer Salas Ibarra |
| | Michael Camilo Marín Hernández |

**Docente:** Ana María Caviedes  
**Institución:** Corporación Universitaria Autónoma del Cauca  
**Programa:** Ingeniería de Software y Computación — Popayán, Cauca

</div>

<br/>

---

<div align="center">

*Magic Film — Análisis cinematográfico adaptativo · v1.0 · 2026*

</div>
