-- ==============================================================
-- SCHEMA DATABASE: laporan_casing (Teknisi Casing)
-- File ini khusus database casing. Import HANYA ke database laporan_casing.
-- Tabel: users, admin_*, paket_*
-- ==============================================================

-- Import ke database casing yang sudah dipilih di phpMyAdmin.
-- Nama database mengikuti config/casing.js (boleh berprefix cPanel).

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL DEFAULT 'Admin',
  `avatar` LONGTEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`, `avatar`) VALUES
(1, 'hardware', 'hardware123', 'Teknisi Hardware', 'Teknisi Hardware', NULL),
(2, 'casing', 'casing123', 'Teknisi Casing', 'Teknisi Casing', NULL)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `nama` = VALUES(`nama`), `role` = VALUES(`role`);

-- --------------------------------------------------------------
-- Landing page: Dari Admin Stock  [casing_admin]  -> tabel admin_*
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_jenis_alat` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_kategori_lokasi` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_laporan` (
  `id` BIGINT NOT NULL,
  `no` VARCHAR(50) DEFAULT '',
  `tanggalMasuk` VARCHAR(50) DEFAULT '',
  `tanggalKeluar` VARCHAR(50) DEFAULT '',
  `jumlahAlat` INT DEFAULT 1,
  `keteranganPerbaikan` TEXT,
  `jenisAlatId` BIGINT DEFAULT NULL,
  `jenisAlatNama` VARCHAR(255) DEFAULT '',
  `lokasiDari` VARCHAR(255) DEFAULT '',
  `kondisi` VARCHAR(50) DEFAULT 'Lama',
  `lamaHari` INT DEFAULT 0,
  `persenHidup` DECIMAL(5,2) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_admin_tgl_masuk` (`tanggalMasuk`),
  INDEX `idx_admin_lokasi` (`lokasiDari`),
  INDEX `idx_admin_jenis` (`jenisAlatNama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- Landing page: Dari Paket  [casing_paket]  -> tabel paket_*
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paket_jenis_alat` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `paket_kategori_lokasi` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `paket_laporan` (
  `id` BIGINT NOT NULL,
  `no` VARCHAR(50) DEFAULT '',
  `tanggalMasuk` VARCHAR(50) DEFAULT '',
  `tanggalKeluar` VARCHAR(50) DEFAULT '',
  `jumlahAlat` INT DEFAULT 1,
  `keteranganPerbaikan` TEXT,
  `jenisAlatId` BIGINT DEFAULT NULL,
  `jenisAlatNama` VARCHAR(255) DEFAULT '',
  `lokasiDari` VARCHAR(255) DEFAULT '',
  `kondisi` VARCHAR(50) DEFAULT 'Lama',
  `lamaHari` INT DEFAULT 0,
  `persenHidup` DECIMAL(5,2) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_paket_tgl_masuk` (`tanggalMasuk`),
  INDEX `idx_paket_lokasi` (`lokasiDari`),
  INDEX `idx_paket_jenis` (`jenisAlatNama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
