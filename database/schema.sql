-- ============================================================
--  MAGIC FILM — Esquema de Base de Datos MySQL
--  Versión 0.1 | Febrero 2026
--  Autores: Michael Hernández, Yennifer Salas, Luis Riascos
-- ============================================================

CREATE DATABASE IF NOT EXISTS magic_film
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE magic_film;

-- ============================================================
-- TABLA: generos
-- Catálogo fijo de géneros cinematográficos.
-- RF-001: El usuario selecciona 3 géneros de esta lista.
-- ============================================================
CREATE TABLE generos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL UNIQUE,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: usuarios
-- RF-001: nivel_cinefilo y onboarding_completo.
-- ============================================================
CREATE TABLE usuarios (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario        VARCHAR(50)  NOT NULL UNIQUE,
  email                 VARCHAR(150) NOT NULL UNIQUE,
  password_hash         VARCHAR(255) NOT NULL,
  nombre_completo       VARCHAR(100),
  rol                   ENUM('invitado','registrado','admin') NOT NULL DEFAULT 'registrado',
  nivel_cinefilo        ENUM('explorador','entusiasta','experto') DEFAULT NULL,
  onboarding_completo   BOOLEAN NOT NULL DEFAULT FALSE,
  activo                BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA PIVOT: usuario_generos  (N:M usuarios ↔ generos)
-- RF-001: Mínimo 3 géneros requeridos en el onboarding.
-- ============================================================
CREATE TABLE usuario_generos (
  usuario_id  INT UNSIGNED NOT NULL,
  genero_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, genero_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (genero_id)  REFERENCES generos(id)  ON DELETE CASCADE
);

-- ============================================================
-- TABLA: peliculas
-- RF-002: Resultado de búsqueda desde TMDB.
-- RF-003: tipo_analisis detectado automáticamente.
-- OBJ-01: Fuente principal de datos del sistema.
-- ============================================================
CREATE TABLE peliculas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tmdb_id         INT UNSIGNED UNIQUE,
  titulo          VARCHAR(255) NOT NULL,
  titulo_original VARCHAR(255),
  anio            YEAR,
  director        VARCHAR(150),
  duracion_min    SMALLINT UNSIGNED,
  sinopsis        TEXT,
  presupuesto     BIGINT UNSIGNED,
  recaudacion     BIGINT UNSIGNED,
  calificacion    DECIMAL(3,1),
  poster_url      VARCHAR(500),
  tipo_analisis   ENUM('entretenimiento','profundo') NOT NULL DEFAULT 'entretenimiento',
  tipo_forzado    BOOLEAN NOT NULL DEFAULT FALSE,
  activa          BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA PIVOT: pelicula_generos  (N:M peliculas ↔ generos)
-- ============================================================
CREATE TABLE pelicula_generos (
  pelicula_id INT UNSIGNED NOT NULL,
  genero_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (pelicula_id, genero_id),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
  FOREIGN KEY (genero_id)   REFERENCES generos(id)   ON DELETE CASCADE
);

-- ============================================================
-- TABLA: analisis
-- RF-004: 1 análisis por película, almacenado para no regenerar.
-- ============================================================
CREATE TABLE analisis (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelicula_id     INT UNSIGNED NOT NULL UNIQUE,
  tipo            ENUM('entretenimiento','profundo') NOT NULL,
  modelo_ia       VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  generado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: capas_analisis
-- RF-005: Cada sección del análisis almacenada por separado.
--
-- Modo ENTRETENIMIENTO: resumen, momentos, easter_eggs, curiosidades
-- Modo PROFUNDO:        narrativa, simbolismo, contexto, tecnica, conclusion
-- ============================================================
CREATE TABLE capas_analisis (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analisis_id INT UNSIGNED NOT NULL,
  nombre_capa ENUM(
    'resumen','momentos','easter_eggs','curiosidades',
    'narrativa','simbolismo','contexto','tecnica','conclusion'
  ) NOT NULL,
  contenido   LONGTEXT NOT NULL,
  orden       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  UNIQUE KEY uq_analisis_capa (analisis_id, nombre_capa),
  FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: favoritos
-- Películas guardadas por el usuario registrado.
-- ============================================================
CREATE TABLE favoritos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  pelicula_id INT UNSIGNED NOT NULL,
  guardado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (usuario_id, pelicula_id),
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: historial_admin
-- RF-006: Registro de todas las acciones del administrador.
-- ============================================================
CREATE TABLE historial_admin (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id     INT UNSIGNED NOT NULL,
  accion       ENUM('agregar','modificar','eliminar','regenerar_ia') NOT NULL,
  entidad      VARCHAR(50)  NOT NULL,
  entidad_id   INT UNSIGNED,
  detalle      VARCHAR(500),
  realizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO generos (nombre) VALUES
  ('Acción'),('Drama'),('Comedia'),('Terror'),
  ('Ciencia Ficción'),('Thriller'),('Romance'),('Psicológico'),
  ('Animación'),('Documental'),('Histórico'),('Musical');

INSERT INTO usuarios (nombre_usuario, email, password_hash, nombre_completo, rol, onboarding_completo)
VALUES ('admin','admin@magicfilm.com','HASH_PENDIENTE','Administrador Magic Film','admin',TRUE);
