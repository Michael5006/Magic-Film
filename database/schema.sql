-- ============================================================
--  MAGIC FILM — Base de Datos MySQL
--  Versión 0.1 | Marzo 2026
--  Autores: Michael Hernández, Yennifer Salas, Luis Riascos
--
--  Cambios v0.1:
--   + Tabla catalogo_peliculas (gestor / puente de consultas)
-- ============================================================

CREATE DATABASE IF NOT EXISTS magic_filmv01
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE magic_filmv01;

-- ============================================================
-- TABLA: generos
-- ============================================================
CREATE TABLE generos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100),
  rol ENUM('invitado','registrado','admin') NOT NULL DEFAULT 'registrado',
  nivel_cinefilo ENUM('explorador','entusiasta','experto') DEFAULT NULL,
  onboarding_completo BOOLEAN NOT NULL DEFAULT FALSE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: usuario_generos (N:M)
-- ============================================================
CREATE TABLE usuario_generos (
  usuario_id INT UNSIGNED NOT NULL,
  genero_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, genero_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: peliculas (fuente principal)
-- ============================================================
CREATE TABLE peliculas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tmdb_id INT UNSIGNED UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  titulo_original VARCHAR(255),
  anio YEAR,
  director VARCHAR(150),
  duracion_min SMALLINT UNSIGNED,
  sinopsis TEXT,
  presupuesto BIGINT UNSIGNED,
  recaudacion BIGINT UNSIGNED,
  calificacion DECIMAL(3,1),
  poster_url VARCHAR(500),
  keywords JSON,
  tipo_analisis ENUM('entretenimiento','profundo') NOT NULL DEFAULT 'entretenimiento',
  tipo_forzado BOOLEAN NOT NULL DEFAULT FALSE,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (calificacion BETWEEN 0 AND 10)
);

-- ============================================================
-- TABLA GESTORA: catalogo_peliculas
-- Centraliza búsquedas y listados
-- ============================================================
CREATE TABLE catalogo_peliculas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelicula_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  anio YEAR,
  calificacion DECIMAL(3,1),
  poster_url VARCHAR(500),
  texto_busqueda TEXT,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: pelicula_generos (N:M)
-- ============================================================
CREATE TABLE pelicula_generos (
  pelicula_id INT UNSIGNED NOT NULL,
  genero_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (pelicula_id, genero_id),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
  FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: analisis
-- ============================================================
CREATE TABLE analisis (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelicula_id INT UNSIGNED NOT NULL UNIQUE,
  tipo ENUM('entretenimiento','profundo') NOT NULL,
  modelo_ia VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  estado ENUM('pendiente','generando','completo','error') DEFAULT 'pendiente',
  idioma VARCHAR(5) DEFAULT 'es',
  eliminado BOOLEAN NOT NULL DEFAULT FALSE,
  generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: capas_analisis
-- ============================================================
CREATE TABLE capas_analisis (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analisis_id INT UNSIGNED NOT NULL,
  modo ENUM('entretenimiento','profundo') NOT NULL,
  nombre_capa ENUM(
    'resumen','momentos','easter_eggs','curiosidades',
    'narrativa','simbolismo','contexto','tecnica','conclusion'
  ) NOT NULL,
  contenido LONGTEXT NOT NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 1,
  UNIQUE KEY uq_analisis_capa (analisis_id, nombre_capa),
  FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: favoritos
-- ============================================================
CREATE TABLE favoritos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  pelicula_id INT UNSIGNED NOT NULL,
  guardado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorito (usuario_id, pelicula_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: historial_busquedas
-- ============================================================
CREATE TABLE historial_busquedas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  termino_buscado VARCHAR(255) NOT NULL,
  pelicula_id INT UNSIGNED,
  buscado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: historial_admin
-- ============================================================
CREATE TABLE historial_admin (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  accion ENUM('agregar','modificar','eliminar','regenerar_ia') NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidad_id INT UNSIGNED,
  detalle VARCHAR(500),
  realizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: log_ia
-- ============================================================
CREATE TABLE log_ia (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analisis_id INT UNSIGNED,
  prompt_usado TEXT,
  tokens_estimados INT,
  tiempo_ms INT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE SET NULL
);

-- ============================================================
-- ÍNDICES DE OPTIMIZACIÓN
-- ============================================================
CREATE INDEX idx_peliculas_tmdb        ON peliculas (tmdb_id);
CREATE INDEX idx_catalogo_titulo       ON catalogo_peliculas (titulo);
CREATE INDEX idx_favoritos_usuario     ON favoritos (usuario_id);
CREATE INDEX idx_usuario_generos       ON usuario_generos (usuario_id);
CREATE INDEX idx_pelicula_generos      ON pelicula_generos (pelicula_id);
CREATE INDEX idx_historial_busquedas   ON historial_busquedas (usuario_id);
CREATE INDEX idx_capas_analisis        ON capas_analisis (analisis_id);

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO generos (nombre) VALUES
('Acción'),('Drama'),('Comedia'),('Terror'),
('Ciencia Ficción'),('Thriller'),('Romance'),('Psicológico'),
('Animación'),('Documental'),('Histórico'),('Musical');

INSERT INTO usuarios (
  nombre_usuario, email, password_hash, nombre_completo, rol, onboarding_completo
) VALUES (
  'admin',
  'admin@magicfilm.com',
  'HASH_PENDIENTE',
  'Administrador Magic Film',
  'admin',
  TRUE
);