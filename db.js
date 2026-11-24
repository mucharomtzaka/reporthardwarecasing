// ==============================================================
// MYSQL DATABASE CONNECTOR (2 DATABASE + TABEL TERPISAH PER LANDING PAGE)
//
// Hanya 2 database MySQL:
//   1. laporan_hardware  -> Teknisi Hardware
//        - tabel hp_*     : Service HP, PC & Tab   (landing: hardware_hp)
//        - tabel alat_*   : Service Alat Lain      (landing: hardware_alat)
//        - tabel rusak_*  : Data Barang Rusak      (landing: hardware_rusak)
//   2. laporan_casing    -> Teknisi Casing
//        - tabel admin_*  : Dari Admin Stock       (landing: casing_admin)
//        - tabel paket_*  : Dari Paket             (landing: casing_paket)
//
// Setiap database punya 1 tabel `users` bersama (user: hardware & casing).
// Setiap landing page punya 3 tabel sendiri: <prefix>_jenis_alat,
// <prefix>_kategori_lokasi, <prefix>_laporan  -> data antar landing page
// TIDAK PERNAH tercampur.
// Otomatis membuat database & tabel, auto-seed dari JSON, auto-fallback JSON.
// ==============================================================

const fs = require('fs');
const path = require('path');

let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.warn('⚠️ Modul mysql2 belum tersedia. Pastikan menjalankan "npm install mysql2".');
}

// Key landing page (tetap sama dengan frontend) -> database induk + prefix tabel
const LANDING_MAP = {
  hardware_hp:    { db: 'hardware', prefix: 'hp' },
  hardware_alat:  { db: 'hardware', prefix: 'alat' },
  hardware_rusak: { db: 'hardware', prefix: 'rusak' },
  casing_admin:   { db: 'casing',   prefix: 'admin' },
  casing_paket:   { db: 'casing',   prefix: 'paket' }
};

const DB_KEYS = Object.keys(LANDING_MAP);          // 5 landing page
const PARENT_KEYS = ['hardware', 'casing'];        // 2 database

function normalizeDbKey(key) {
  const k = String(key || '').toLowerCase().trim();
  if (k === 'hardware') return 'hardware_hp';
  if (k === 'casing') return 'casing_admin';
  if (DB_KEYS.includes(k)) return k;
  return 'hardware_hp';
}

function tbl(key, name) {
  return '`' + LANDING_MAP[key].prefix + '_' + name + '`';
}

const CONFIG_DIR = path.join(__dirname, 'config');
const DEFAULT_DB_NAMES = { hardware: 'laporan_hardware', casing: 'laporan_casing' };

function parentOf(key) {
  const k = String(key || '').toLowerCase().trim();
  if (PARENT_KEYS.includes(k)) return k;
  if (LANDING_MAP[k]) return LANDING_MAP[k].db;
  return 'hardware';
}

// Baca config/<parent>.js (satu file per user/database) — kredensial tidak bercampur
function readUserConfig(pk) {
  const file = path.join(CONFIG_DIR, pk + '.js');
  if (!fs.existsSync(file)) return {};
  try {
    delete require.cache[require.resolve(file)];
    return require(file) || {};
  } catch (e) {
    console.error(`Gagal membaca config/${pk}.js:`, e.message);
    return {};
  }
}

// Fallback: config.json lama (satu kredensial untuk kedua database)
function readLegacyConfig() {
  const file = path.join(__dirname, 'config.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) || {};
  } catch (e) {
    console.error('Gagal membaca config.json:', e.message);
    return {};
  }
}

// Konfigurasi terpisah per database. Prioritas: env > config/<parent>.js > config.json > default.
function getParentConfig(pk) {
  const parent = parentOf(pk);
  const up = parent.toUpperCase();
  const file = readUserConfig(parent);
  const legacy = readLegacyConfig();
  const legacyDbs = legacy.databases || {};
  const password = (process.env[`DB_${up}_PASSWORD`] !== undefined) ? process.env[`DB_${up}_PASSWORD`]
    : (process.env.DB_PASSWORD !== undefined) ? process.env.DB_PASSWORD
    : (file.password !== undefined) ? file.password
    : (legacy.password !== undefined) ? legacy.password : '';
  return {
    parent,
    host: process.env[`DB_${up}_HOST`] || process.env.DB_HOST || file.host || legacy.host || 'localhost',
    user: process.env[`DB_${up}_USER`] || process.env.DB_USER || file.user || legacy.user || 'root',
    password,
    port: parseInt(process.env[`DB_${up}_PORT`] || process.env.DB_PORT || file.port || legacy.port || 3306, 10),
    database: process.env[`DB_${up}_NAME`] || process.env[`DB_${up}`] || file.database || legacyDbs[parent] || DEFAULT_DB_NAMES[parent]
  };
}

function getDbConfig(parentKey) {
  if (parentKey) return getParentConfig(parentKey);
  const configs = {};
  PARENT_KEYS.forEach(pk => { configs[pk] = getParentConfig(pk); });
  return {
    configs,
    databases: Object.fromEntries(PARENT_KEYS.map(pk => [pk, configs[pk].database]))
  };
}

const pools = {};              // pools[parentKey]
const parentStatus = {};       // parentKey -> boolean
const landingStatus = {};      // landingKey -> boolean
PARENT_KEYS.forEach(k => { parentStatus[k] = false; });
DB_KEYS.forEach(k => { landingStatus[k] = false; });

async function createUsersTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` BIGINT NOT NULL,
      \`username\` VARCHAR(100) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`nama\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(100) NOT NULL DEFAULT 'Admin',
      \`avatar\` LONGTEXT NULL,
      \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function createLandingTables(pool, key) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tbl(key, 'jenis_alat')} (
      \`id\` BIGINT NOT NULL,
      \`nama\` VARCHAR(255) NOT NULL,
      \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tbl(key, 'kategori_lokasi')} (
      \`id\` BIGINT NOT NULL,
      \`nama\` VARCHAR(255) NOT NULL,
      \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const p = LANDING_MAP[key].prefix;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tbl(key, 'laporan')} (
      \`id\` BIGINT NOT NULL,
      \`no\` VARCHAR(50) DEFAULT '',
      \`tanggalMasuk\` VARCHAR(50) DEFAULT '',
      \`tanggalKeluar\` VARCHAR(50) DEFAULT '',
      \`jumlahAlat\` INT DEFAULT 1,
      \`keteranganPerbaikan\` TEXT,
      \`jenisAlatId\` BIGINT DEFAULT NULL,
      \`jenisAlatNama\` VARCHAR(255) DEFAULT '',
      \`lokasiDari\` VARCHAR(255) DEFAULT '',
      \`kondisi\` VARCHAR(50) DEFAULT 'Lama',
      \`lamaHari\` INT DEFAULT 0,
      \`persenHidup\` DECIMAL(5,2) DEFAULT NULL,
      \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`idx_${p}_tgl_masuk\` (\`tanggalMasuk\`),
      INDEX \`idx_${p}_lokasi\` (\`lokasiDari\`),
      INDEX \`idx_${p}_jenis\` (\`jenisAlatNama\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Migrasi: tambah kolom persenHidup bila tabel dibuat dari versi sebelumnya
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'persenHidup'`,
    [LANDING_MAP[key].prefix + '_laporan']
  );
  if (cols.length === 0) {
    await pool.query(`ALTER TABLE ${tbl(key, 'laporan')} ADD COLUMN \`persenHidup\` DECIMAL(5,2) DEFAULT NULL AFTER \`lamaHari\``);
  }
}

// Inisialisasi 2 database + tabel per landing page
async function initDatabase(initialDataMap = {}) {
  if (!mysql) return false;

  // 1 + 2. Buat database, pool, dan tabel users pakai kredensial masing-masing parent
  for (const pk of PARENT_KEYS) {
    const cfg = getParentConfig(pk);
    let tempConn = null;
    try {
      tempConn = await mysql.createConnection({
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        port: cfg.port
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConn.end();
      tempConn = null;
    } catch (err) {
      console.warn(`⚠️ MySQL [${pk}] tidak aktif (${err.message}). Database ini memakai penyimpanan file JSON otomatis.`);
      if (tempConn) {
        try { await tempConn.end(); } catch (e) {}
      }
      parentStatus[pk] = false;
      pools[pk] = null;
      continue;
    }

    try {
      const pool = mysql.createPool({
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        port: cfg.port,
        database: cfg.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });
      await createUsersTable(pool);
      pools[pk] = pool;
      parentStatus[pk] = true;
      console.log(`✓ Terhubung ke database MySQL: [${cfg.database}] (${pk})`);
    } catch (err) {
      console.warn(`⚠️ Gagal menginisialisasi database [${cfg.database}] (${pk}): ${err.message}`);
      parentStatus[pk] = false;
      pools[pk] = null;
    }
  }

  // 3. Tabel per landing page + auto-seed bila masih kosong
  for (const key of DB_KEYS) {
    const pk = LANDING_MAP[key].db;
    const pool = pools[pk];
    if (!parentStatus[pk] || !pool) continue;

    try {
      await createLandingTables(pool, key);
      landingStatus[key] = true;

      const [cnt] = await pool.query(
        `SELECT (SELECT COUNT(*) FROM ${tbl(key, 'jenis_alat')}) AS ja,
                (SELECT COUNT(*) FROM ${tbl(key, 'kategori_lokasi')}) AS kl,
                (SELECT COUNT(*) FROM ${tbl(key, 'laporan')}) AS lp`
      );
      const empty = cnt[0].ja === 0 && cnt[0].kl === 0 && cnt[0].lp === 0;
      const seed = initialDataMap[key] || initialDataMap['default'];
      if (empty && seed) {
        console.log(`📦 Memigrasikan data awal ke tabel ${LANDING_MAP[key].prefix}_* [${getParentConfig(pk).database}]...`);
        await saveDataToDb(seed, key);
      }
      console.log(`  ✓ Landing [${key}] -> ${getParentConfig(pk).database}.${LANDING_MAP[key].prefix}_*`);
    } catch (err) {
      console.warn(`⚠️ Gagal menyiapkan tabel landing [${key}]: ${err.message}`);
      landingStatus[key] = false;
    }
  }

  return Object.values(landingStatus).some(Boolean);
}

// Ambil data satu landing page (hanya tabel miliknya + users bersama)
async function getDataFromDb(targetDb = 'hardware_hp') {
  const key = normalizeDbKey(targetDb);
  const pool = pools[LANDING_MAP[key].db];
  if (!landingStatus[key] || !pool) return null;

  try {
    const [users] = await pool.query('SELECT id, username, password, nama, role, avatar FROM users ORDER BY id ASC');
    const [jenisAlat] = await pool.query(`SELECT id, nama FROM ${tbl(key, 'jenis_alat')} ORDER BY nama ASC`);
    const [kategoriLokasi] = await pool.query(`SELECT id, nama FROM ${tbl(key, 'kategori_lokasi')} ORDER BY nama ASC`);
    const [laporan] = await pool.query(
      `SELECT id, no, tanggalMasuk, tanggalKeluar, jumlahAlat, keteranganPerbaikan, jenisAlatId, jenisAlatNama, lokasiDari, kondisi, lamaHari, persenHidup
       FROM ${tbl(key, 'laporan')} ORDER BY id ASC`
    );

    return {
      users: users || [],
      jenisAlat: jenisAlat || [],
      kategoriLokasi: kategoriLokasi || [],
      laporan: laporan || []
    };
  } catch (err) {
    console.error(`Error saat mengambil data dari MySQL [${key}]:`, err.message);
    return null;
  }
}

function uniqueId(raw, seen, counter) {
  let id = parseInt(raw, 10);
  if (!id || seen.has(id)) id = ++counter.n;
  seen.add(id);
  return id;
}

// Simpan data satu landing page. Hanya menyentuh tabel prefix miliknya + users.
async function saveDataToDb(data, targetDb = 'hardware_hp') {
  const key = normalizeDbKey(targetDb);
  const pool = pools[LANDING_MAP[key].db];
  if (!landingStatus[key] || !pool) return false;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Users (tabel bersama di database ini)
    if (Array.isArray(data.users) && data.users.length > 0) {
      await conn.query('DELETE FROM users');
      for (const u of data.users) {
        await conn.query(
          'INSERT INTO users (id, username, password, nama, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          [u.id || 1, u.username || 'hardware', u.password || '', u.nama || '', u.role || 'Teknisi', u.avatar || null]
        );
      }
    }

    // 2. Jenis alat (khusus landing ini)
    if (Array.isArray(data.jenisAlat)) {
      await conn.query(`DELETE FROM ${tbl(key, 'jenis_alat')}`);
      const seen = new Set();
      const counter = { n: Date.now() };
      for (const j of data.jenisAlat) {
        j.id = uniqueId(j.id, seen, counter);
        await conn.query(`INSERT INTO ${tbl(key, 'jenis_alat')} (id, nama) VALUES (?, ?)`, [j.id, j.nama || '']);
      }
    }

    // 3. Kategori lokasi (khusus landing ini)
    if (Array.isArray(data.kategoriLokasi)) {
      await conn.query(`DELETE FROM ${tbl(key, 'kategori_lokasi')}`);
      const seen = new Set();
      const counter = { n: Date.now() };
      for (const k of data.kategoriLokasi) {
        k.id = uniqueId(k.id, seen, counter);
        await conn.query(`INSERT INTO ${tbl(key, 'kategori_lokasi')} (id, nama) VALUES (?, ?)`, [k.id, k.nama || '']);
      }
    }

    // 4. Laporan (khusus landing ini)
    if (Array.isArray(data.laporan)) {
      await conn.query(`DELETE FROM ${tbl(key, 'laporan')}`);
      const seen = new Set();
      const counter = { n: Date.now() };
      for (const l of data.laporan) {
        l.id = uniqueId(l.id, seen, counter);
        await conn.query(
          `INSERT INTO ${tbl(key, 'laporan')}
          (id, no, tanggalMasuk, tanggalKeluar, jumlahAlat, keteranganPerbaikan, jenisAlatId, jenisAlatNama, lokasiDari, kondisi, lamaHari, persenHidup)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            l.id,
            l.no || '',
            l.tanggalMasuk || '',
            l.tanggalKeluar || '',
            parseInt(l.jumlahAlat, 10) || 1,
            l.keteranganPerbaikan || '',
            l.jenisAlatId || null,
            l.jenisAlatNama || '',
            l.lokasiDari || '',
            l.kondisi || 'Lama',
            parseInt(l.lamaHari, 10) || 0,
            (l.persenHidup === undefined || l.persenHidup === null || l.persenHidup === '' || isNaN(parseFloat(l.persenHidup))) ? null : parseFloat(l.persenHidup)
          ]
        );
      }
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    console.error(`Error saat menyimpan ke MySQL [${key}]:`, err.message);
    return false;
  } finally {
    conn.release();
  }
}

function getDatabaseStatus(targetDb = null) {
  if (targetDb) {
    const key = normalizeDbKey(targetDb);
    const info = LANDING_MAP[key];
    const cfg = getParentConfig(info.db);
    return {
      target: key,
      engine: landingStatus[key] ? 'mysql' : 'json',
      connected: !!landingStatus[key],
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      tablePrefix: info.prefix + '_'
    };
  }

  const statusMap = {};
  DB_KEYS.forEach(k => {
    const info = LANDING_MAP[k];
    statusMap[k] = {
      connected: !!landingStatus[k],
      database: getParentConfig(info.db).database,
      tablePrefix: info.prefix + '_'
    };
  });

  const hw = getParentConfig('hardware');
  return {
    engine: Object.values(landingStatus).some(Boolean) ? 'mysql' : 'json',
    connected: Object.values(landingStatus).some(Boolean),
    host: hw.host,
    port: hw.port,
    databases: statusMap
  };
}

module.exports = {
  DB_KEYS,
  PARENT_KEYS,
  LANDING_MAP,
  normalizeDbKey,
  initDatabase,
  getDataFromDb,
  saveDataToDb,
  getDatabaseStatus,
  getDbConfig,
  getParentConfig
};
