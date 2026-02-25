<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Playfair+Display&size=42&duration=3000&pause=1000&color=F5A623&center=true&vCenter=true&width=600&height=80&lines=Magic+Film+%F0%9F%8E%AC;An%C3%A1lisis+Cinematogr%C3%A1fico+con+IA" alt="Magic Film" />

<br/>

**Plataforma web de análisis cinematográfico adaptativo impulsado por inteligencia artificial.**  
*Entiende el Verdadero Significado del Cine*

<br/>

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-f5a623?style=for-the-badge&logo=github)](https://github.com/Michael5006/magic-film)
[![Versión](https://img.shields.io/badge/Versión-0.1%20Mockup-9b59b6?style=for-the-badge)](https://github.com/Michael5006/magic-film)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-2ecc71?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
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
   └── NO → llama a Google Gemini → guarda → devuelve
        ↓
Frontend pinta las pantallas con el resultado
```

<br/>

## Tipos de análisis

| Modo | Películas objetivo | Contenido generado |
|------|-------------------|-------------------|
| **Entretenimiento** | Blockbusters, comedias, series | Resumen sin spoilers · Momentos épicos · Easter eggs · Curiosidades de producción |
| **Profundo** | Cine de autor, dramas, folk horror | Simbolismo visual · Temas · Contexto cultural · Análisis del director |

<br/>

## Stack tecnológico

<div align="center">

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5 · CSS3 · JavaScript ES6+ |
| **Backend** | Node.js · Express.js |
| **Base de datos** | MySQL |
| **IA generativa** | Google Gemini 1.5 Flash |
| **Datos de películas** | TMDB API v3 |
| **Autenticación** | JWT |

</div>

<br/>

## Arquitectura del proyecto

El sistema sigue una arquitectura **MVC de 3 capas**. El frontend nunca se comunica directamente con TMDB ni Gemini — toda llamada pasa por el backend, protegiendo las API Keys.

```
Cliente (HTML/CSS/JS)  →  Backend API REST (Node.js/Express)  →  MySQL + APIs externas
```

```
magic-film/
├── backend/
│   ├── config/          → Configuración de DB y variables de entorno
│   ├── controllers/     → Lógica de negocio por entidad
│   ├── models/          → Acceso a la base de datos (consultas SQL)
│   ├── routes/          → Definición de endpoints REST
│   ├── middlewares/     → Auth, adminOnly, validación de input
│   ├── services/        → Integración con TMDB, Gemini, clasificador
│   ├── utils/           → Funciones reutilizables (errores, respuestas)
│   └── server.js        → Punto de entrada del servidor
│
├── frontend/
│   ├── pages/           → Archivos HTML
│   ├── css/
│   │   ├── variables.css
│   │   ├── global.css
│   │   ├── components/
│   │   └── pages/
│   ├── js/
│   │   ├── api/         → Llamadas fetch al backend
│   │   ├── components/
│   │   └── pages/
│   └── assets/          → Imágenes e íconos
│
├── database/
│   ├── schema.sql
│   ├── seeds/
│   └── MER/
│
├── docs/
│   └── Documentacion-Magic-Film.pdf
│
├── .env.example
├── package.json
└── README.md
```

<br/>

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| **Invitado** | Buscar películas · Ver análisis existentes |
| **Registrado** | Todo lo anterior + Generar análisis · Guardar favoritos · Recomendaciones personalizadas |
| **Administrador** | Gestión completa de películas · Regenerar análisis · Panel de monitoreo |

<br/>


## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Diseño UI/UX completo | ✅ Completado |
| 2 | Mockup interactivo HTML/CSS/JS | ✅ Completado |
| 3 | Flujo de registro, login y configuración de perfil | ✅ Completado |
| 4 | Backend Node.js + Express | 🔄 En progreso |
| 5 | Integración TMDB API | ⏳ Pendiente |
| 6 | Integración Google Gemini API | ⏳ Pendiente |
| 7 | Base de datos MySQL | ⏳ Pendiente |
| 8 | Conexión frontend ↔ backend | ⏳ Pendiente |
| 9 | Pruebas y despliegue | ⏳ Pendiente |

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

*Magic Film — Análisis cinematográfico adaptativo · 2026*

</div>
