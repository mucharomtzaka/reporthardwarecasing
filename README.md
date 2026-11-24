# 🌐 Laporan Service Multi-Landing Page

Web app **Laporan Service** multi-landing page (Teknisi Hardware & Casing) dengan backend Node.js + MySQL/MariaDB, fallback JSON.

## ✨ Fitur
- **5 landing page**: Service HP & PC (hardware_hp), Service Alat (hardware_alat), Data Barang Rusak (hardware_rusak), Casing Admin (casing_admin), Casing Paket (casing_paket).
- **2 database MySQL**: `laporan_hardware` & `laporan_casing`, masing-masing punya tabel terpisah per landing page (`hp_*`, `alat_*`, `rusak_*` / `admin_*`, `paket_*`).
- Konfigurasi **terpisah per user/database** di `config/hardware.js` dan `config/casing.js`.
- Fallback penyimpanan JSON di folder `data/` bila MySQL tidak aktif.

## 📁 Struktur
```
server.js, db.js
web/            -> frontend (HTML, CSS, JS client)
config/
  hardware.js   -> konfigurasi database Teknisi Hardware
  casing.js     -> konfigurasi database Teknisi Casing
database/
  hardware.sql  -> schema database + tabel hardware
  casing.sql    -> schema database + tabel casing
data/           -> backup JSON (fallback)
test/           -> cek konfigurasi & schema
```

## ⚙️ Konfigurasi
- Edit `config/hardware.js` dan `config/casing.js` secara terpisah. Kredensial hardware tidak boleh bercampur ke database casing.
- Override via environment:
  - `DB_HARDWARE_HOST`, `DB_HARDWARE_USER`, `DB_HARDWARE_PASSWORD`, `DB_HARDWARE_PORT`, `DB_HARDWARE_NAME`
  - `DB_CASING_HOST`, `DB_CASING_USER`, `DB_CASING_PASSWORD`, `DB_CASING_PORT`, `DB_CASING_NAME`

## 🚀 Quick Start
```bash
npm install
npm start
```

Buka `http://localhost:3000`.

Login default: `hardware` / `hardware123` dan `casing` / `casing123`.

Panduan hosting lengkap: [`DEPLOY_PANDUAN.md`](DEPLOY_PANDUAN.md).

## ✅ Cek
```bash
node test/config.test.js
node test/sql.test.js
```
