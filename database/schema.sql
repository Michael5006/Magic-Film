-- ============================================================
--  MAGIC FILM — Base de Datos MySQL
--  Versión 0.2 | Abril 2026
--  Autores: Michael Hernández, Yennifer Salas, Luis Riascos
--
--  Cambios v0.2 (basado en dump real 04/04/2026):
--   + peliculas: backdrop_url, media_type, reparto, similares
--   + usuario_generos: columna genero_nombre (usado en onboarding)
--   + analisis: modelo_ia default actualizado a llama-3.3-70b-versatile
-- ============================================================

CREATE DATABASE IF NOT EXISTS magic_filmv01
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE magic_filmv01;

-- ============================================================
-- TABLA: generos
-- ============================================================
CREATE TABLE generos (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(50) NOT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario      VARCHAR(50)  NOT NULL UNIQUE,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password_hash               VARCHAR(255) DEFAULT NULL,
  nombre_completo             VARCHAR(100),
  rol                         ENUM('invitado','registrado','admin') NOT NULL DEFAULT 'registrado',
  nivel_cinefilo              ENUM('explorador','entusiasta','experto') DEFAULT NULL,
  onboarding_completo         BOOLEAN NOT NULL DEFAULT FALSE,
  activo                      BOOLEAN NOT NULL DEFAULT TRUE,
  foto_perfil                 MEDIUMTEXT DEFAULT NULL,
  bio                         VARCHAR(300) DEFAULT NULL,
  email_verificado            BOOLEAN NOT NULL DEFAULT FALSE,
  token_verificacion          VARCHAR(255) DEFAULT NULL,
  token_verificacion_expira   DATETIME DEFAULT NULL,
  reset_token                 VARCHAR(255) DEFAULT NULL,
  reset_token_expira          DATETIME DEFAULT NULL,
  google_id                   VARCHAR(100) DEFAULT NULL,
  creado_en                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Si la tabla ya existe, agregar columnas manualmente:
-- ALTER TABLE usuarios ADD COLUMN foto_perfil MEDIUMTEXT DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN bio VARCHAR(300) DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE usuarios ADD COLUMN token_verificacion VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN token_verificacion_expira DATETIME DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN reset_token_expira DATETIME DEFAULT NULL;
-- ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE usuarios MODIFY COLUMN password_hash VARCHAR(255) DEFAULT NULL;

-- ============================================================
-- TABLA: usuario_generos (N:M)
-- NOTA: genero_nombre se agregó para el onboarding (no usa FK a generos)
-- ============================================================
CREATE TABLE usuario_generos (
  usuario_id    INT UNSIGNED NOT NULL,
  genero_id     INT UNSIGNED NOT NULL,
  genero_nombre VARCHAR(50)  NOT NULL DEFAULT '',
  PRIMARY KEY (usuario_id, genero_id),
  KEY idx_usuario_generos (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: peliculas (fuente principal)
-- ============================================================
CREATE TABLE peliculas (
  id                        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tmdb_id                   INT UNSIGNED UNIQUE,
  titulo                    VARCHAR(255) NOT NULL,
  titulo_original           VARCHAR(255),
  anio                      YEAR,
  director                  VARCHAR(150),
  duracion_min              SMALLINT UNSIGNED,
  sinopsis                  TEXT,
  presupuesto               BIGINT UNSIGNED,
  recaudacion               BIGINT UNSIGNED,
  calificacion              DECIMAL(3,1),
  poster_url                VARCHAR(500),
  backdrop_url              VARCHAR(500)  DEFAULT NULL,
  keywords                  JSON,
  tipo_analisis             ENUM('entretenimiento','profundo') NOT NULL DEFAULT 'entretenimiento',
  tipo_forzado              BOOLEAN NOT NULL DEFAULT FALSE,
  media_type                ENUM('movie','tv') NOT NULL DEFAULT 'movie',
  youtube_videos            JSON DEFAULT NULL,
  youtube_videos_updated_at DATETIME DEFAULT NULL,
  activa                    BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reparto                   JSON DEFAULT NULL,
  similares                 JSON DEFAULT NULL,
  CHECK (calificacion BETWEEN 0 AND 10)
);

-- ============================================================
-- TABLA GESTORA: catalogo_peliculas
-- ============================================================
CREATE TABLE catalogo_peliculas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelicula_id    INT UNSIGNED NOT NULL,
  titulo         VARCHAR(255) NOT NULL,
  anio           YEAR,
  calificacion   DECIMAL(3,1),
  poster_url     VARCHAR(500),
  texto_busqueda TEXT,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY pelicula_id (pelicula_id),
  KEY idx_catalogo_titulo (titulo),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: pelicula_generos (N:M)
-- ============================================================
CREATE TABLE pelicula_generos (
  pelicula_id INT UNSIGNED NOT NULL,
  genero_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (pelicula_id, genero_id),
  KEY genero_id (genero_id),
  KEY idx_pelicula_generos (pelicula_id),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
  FOREIGN KEY (genero_id)   REFERENCES generos(id)   ON DELETE CASCADE
);

-- ============================================================
-- TABLA: analisis
-- ============================================================
CREATE TABLE analisis (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelicula_id    INT UNSIGNED NOT NULL UNIQUE,
  tipo           ENUM('entretenimiento','profundo') NOT NULL,
  modelo_ia      VARCHAR(100) DEFAULT 'llama-3.3-70b-versatile',
  estado         ENUM('pendiente','generando','completo','error') DEFAULT 'pendiente',
  idioma         VARCHAR(5) DEFAULT 'es',
  eliminado      BOOLEAN NOT NULL DEFAULT FALSE,
  generado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: capas_analisis
-- ============================================================
CREATE TABLE capas_analisis (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analisis_id INT UNSIGNED NOT NULL,
  modo        ENUM('entretenimiento','profundo') NOT NULL,
  nombre_capa ENUM(
    'resumen','momentos','easter_eggs','curiosidades',
    'narrativa','simbolismo','contexto','tecnica','conclusion'
  ) NOT NULL,
  contenido   LONGTEXT NOT NULL,
  orden       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  UNIQUE KEY uq_analisis_capa (analisis_id, nombre_capa),
  KEY idx_capas_analisis (analisis_id),
  FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: favoritos
-- ============================================================
CREATE TABLE favoritos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  pelicula_id INT UNSIGNED NOT NULL,
  guardado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorito (usuario_id, pelicula_id),
  KEY pelicula_id (pelicula_id),
  KEY idx_favoritos_usuario (usuario_id),
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: historial_busquedas
-- ============================================================
CREATE TABLE historial_busquedas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  termino_buscado VARCHAR(255) NOT NULL,
  pelicula_id     INT UNSIGNED,
  buscado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY pelicula_id (pelicula_id),
  KEY idx_historial_busquedas (usuario_id),
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: historial_admin
-- ============================================================
CREATE TABLE historial_admin (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id     INT UNSIGNED NOT NULL,
  accion       ENUM('agregar','modificar','eliminar','regenerar_ia') NOT NULL,
  entidad      VARCHAR(50) NOT NULL,
  entidad_id   INT UNSIGNED,
  detalle      VARCHAR(500),
  realizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY admin_id (admin_id),
  FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: log_ia
-- ============================================================
CREATE TABLE log_ia (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analisis_id      INT UNSIGNED,
  prompt_usado     TEXT,
  tokens_estimados INT,
  tiempo_ms        INT,
  creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY analisis_id (analisis_id),
  FOREIGN KEY (analisis_id) REFERENCES analisis(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: codigos_verificacion (registro por email)
-- ============================================================
CREATE TABLE codigos_verificacion (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL,
  codigo     VARCHAR(6)   NOT NULL,
  expira_en  DATETIME     NOT NULL,
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_codigos_email (email)
);

-- Si la tabla ya existe, crearla manualmente:
-- (ejecutar el CREATE TABLE arriba en tu cliente MySQL)

-- ============================================================
-- ÍNDICES ADICIONALES EN peliculas
-- ============================================================
CREATE INDEX idx_peliculas_tmdb       ON peliculas (tmdb_id);
CREATE INDEX idx_peliculas_media_type ON peliculas (media_type);

-- ============================================================
-- DATOS INICIALES
-- ============================================================
INSERT INTO generos (nombre) VALUES
('Acción'),('Drama'),('Comedia'),('Terror'),
('Ciencia Ficción'),('Thriller'),('Romance'),('Psicológico'),
('Animación'),('Documental'),('Histórico'),('Musical'),('K-Drama');

-- Password: admin123 (bcrypt)
INSERT INTO usuarios (
  nombre_usuario, email, password_hash, nombre_completo,
  rol, nivel_cinefilo, onboarding_completo
) VALUES (
  'admin',
  'admin@magicfilm.com',
  '$2b$10$IMAtgTs3r01xUatOKQeNaeJyoUXumkbagoSzGwDKWs/4ioYYzVmwa',
  'Administrador Magic Film',
  'admin',
  'experto',
  TRUE
);