-- ==============================================================
-- SCHEMA DATABASE: laporan_hardware (Teknisi Hardware)
-- File ini khusus database hardware. Import HANYA ke database laporan_hardware.
-- Tabel: users, hp_*, alat_*, rusak_*
-- ==============================================================

-- Import ke database hardware yang sudah dipilih di phpMyAdmin.
-- Nama database mengikuti config/hardware.js (boleh berprefix cPanel).

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
-- Landing page: Service HP, PC & Tab  [hardware_hp]  -> tabel hp_*
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hp_jenis_alat` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hp_kategori_lokasi` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hp_laporan` (
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
  INDEX `idx_hp_tgl_masuk` (`tanggalMasuk`),
  INDEX `idx_hp_lokasi` (`lokasiDari`),
  INDEX `idx_hp_jenis` (`jenisAlatNama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- Landing page: Service Alat Lain  [hardware_alat]  -> tabel alat_*
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `alat_jenis_alat` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `alat_kategori_lokasi` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `alat_laporan` (
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
  INDEX `idx_alat_tgl_masuk` (`tanggalMasuk`),
  INDEX `idx_alat_lokasi` (`lokasiDari`),
  INDEX `idx_alat_jenis` (`jenisAlatNama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- Landing page: Data Barang Rusak  [hardware_rusak]  -> tabel rusak_*
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rusak_jenis_alat` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rusak_kategori_lokasi` (
  `id` BIGINT NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rusak_laporan` (
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
  INDEX `idx_rusak_tgl_masuk` (`tanggalMasuk`),
  INDEX `idx_rusak_lokasi` (`lokasiDari`),
  INDEX `idx_rusak_jenis` (`jenisAlatNama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
