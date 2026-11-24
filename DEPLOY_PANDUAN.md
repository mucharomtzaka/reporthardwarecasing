# 🌐 Panduan Lengkap Hosting & Menghubungkan ke Web Server

Panduan ini menjelaskan cara menghosting aplikasi **Laporan Service Multi-Landing Page** beserta **Database MySQL** agar bisa diakses online dari mana saja lewat internet.

---

## 📋 Ringkasan Kebutuhan Server
1. **Node.js**: Versi 16 atau lebih baru (v18 / v20 LTS direkomendasikan).
2. **Database MySQL / MariaDB**:
   Aplikasi menggunakan **2 database**, dengan tabel terpisah per landing page:
   - `laporan_hardware` *(Teknisi Hardware)* ➔ tabel `hp_*` (Service HP, PC & Tab), `alat_*` (Service Alat Lain), `rusak_*` (Data Barang Rusak)
   - `laporan_casing` *(Teknisi Casing)* ➔ tabel `admin_*` (Dari Admin Stock), `paket_*` (Dari Paket)
3. **Penyimpanan Fallback JSON**: Jika MySQL belum aktif atau koneksi terputus, server otomatis menyimpan ke folder `data/` sebagai file JSON sehingga aplikasi tidak akan pernah error/down.

---

## 🛠️ OPSI 1: Hosting di cPanel (Niagahoster, DomaiNesia, IDCloudHost, Hostinger, dll)

Jika Anda menyewa shared hosting yang memiliki fitur **"Setup Node.js App"** dan **cPanel**:

### Langkah 1: Buat 2 Database di cPanel
1. Masuk ke **cPanel** akun hosting Anda.
2. Buka menu **MySQL® Databases**.
3. Buat database (sesuaikan dengan prefix username cPanel Anda, misalnya `user_`):
   - `laporan_hardware`
   - `laporan_casing`
4. Buat **2 MySQL User** terpisah (disarankan), masing-masing dengan password kuat:
   - user hardware ➔ hubungkan hanya ke `laporan_hardware` (ALL PRIVILEGES)
   - user casing ➔ hubungkan hanya ke `laporan_casing` (ALL PRIVILEGES)

### Langkah 2: Import Tabel Awal (file SQL terpisah)
1. Buka menu **phpMyAdmin** di cPanel.
2. Pilih database `laporan_hardware` ➔ tab **Import** ➔ pilih `database/hardware.sql` ➔ **Go**.
3. Pilih database `laporan_casing` ➔ tab **Import** ➔ pilih `database/casing.sql` ➔ **Go**.
*(Atau server Node.js juga akan otomatis membuat tabelnya saat pertama kali dijalankan).*

### Langkah 3: Upload File Aplikasi
1. Buka menu **File Manager** di cPanel.
2. Buat folder untuk aplikasi (misalnya `/home/username/laporan-service`).
3. Upload seluruh file project Anda (termasuk folder `web/`, `config/`, `database/`, `server.js`, `db.js`, `package.json`).
   *Catatan: folder `node_modules` tidak perlu diupload, nanti di-install via npm.*

### Langkah 4: Sesuaikan Konfigurasi Database (terpisah per user)
Edit `config/hardware.js`:
```js
module.exports = {
  host: 'localhost',
  user: 'usernamecpanel_hardware',
  password: 'PasswordHardware123!',
  port: 3306,
  database: 'usernamecpanel_laporan_hardware'
};
```
Edit `config/casing.js`:
```js
module.exports = {
  host: 'localhost',
  user: 'usernamecpanel_casing',
  password: 'PasswordCasing123!',
  port: 3306,
  database: 'usernamecpanel_laporan_casing'
};
```
Kredensial hardware dan casing tidak lagi tercampur. `config.json` lama tetap didukung sebagai fallback.

### Langkah 5: Setup Node.js App di cPanel
1. Di cPanel, cari menu **Setup Node.js App**.
2. Klik tombol **Create Application**:
   - **Node.js version**: Pilih versi 18.x atau 20.x
   - **Application mode**: `Production`
   - **Application root**: Masukkan path folder project Anda (misal `laporan-service`)
   - **Application URL**: Pilih domain atau subdomain Anda (misal `service.domainanda.com`)
   - **Application startup file**: Ketik `server.js`
3. Klik **Create**.
4. Setelah aplikasi dibuat, klik tombol **Run NPM Install** pada halaman yang sama.
5. Klik **Restart Application**.
6. Buka domain Anda di browser ➔ Aplikasi sudah online!

---

## 💻 OPSI 2: Hosting di VPS Ubuntu / Debian (DigitalOcean, Biznet, AWS, Linode)

Opsi VPS memberikan kecepatan tertinggi dan kendali penuh.

### Langkah 1: Update Server & Install Node.js
Login ke VPS Anda lewat SSH:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git mariadb-server nginx
```

### Langkah 2: Setup Database MariaDB / MySQL
```bash
sudo mysql_secure_installation
```
Masuk ke terminal MySQL:
```bash
sudo mysql -u root
```
Jalankan query untuk membuat user dan database terpisah:
```sql
CREATE USER 'teknisi_hardware'@'localhost' IDENTIFIED BY 'PasswordHardware123!';
CREATE USER 'teknisi_casing'@'localhost' IDENTIFIED BY 'PasswordCasing123!';

CREATE DATABASE IF NOT EXISTS laporan_hardware;
CREATE DATABASE IF NOT EXISTS laporan_casing;

GRANT ALL PRIVILEGES ON laporan_hardware.* TO 'teknisi_hardware'@'localhost';
GRANT ALL PRIVILEGES ON laporan_casing.* TO 'teknisi_casing'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

### Langkah 3: Clone Project dari GitHub
```bash
cd /var/www
git clone https://github.com/USERNAME_ANDA/Laporan-Service.git
cd Laporan-Service
npm install
```

### Langkah 4: Sesuaikan Konfigurasi Database (terpisah)
```bash
nano config/hardware.js
nano config/casing.js
```
Isi `config/hardware.js`:
```js
module.exports = {
  host: 'localhost',
  user: 'teknisi_hardware',
  password: 'PasswordHardware123!',
  port: 3306,
  database: 'laporan_hardware'
};
```
Isi `config/casing.js`:
```js
module.exports = {
  host: 'localhost',
  user: 'teknisi_casing',
  password: 'PasswordCasing123!',
  port: 3306,
  database: 'laporan_casing'
};
```

### Langkah 5: Jalankan Server dengan PM2 (Jalan Terus 24 Jam)
```bash
sudo npm install -g pm2
pm2 start server.js --name "laporan-service"
pm2 save
pm2 startup
```

### Langkah 6: Konfigurasi Nginx & Domain (Opsional HTTPS)
```bash
sudo nano /etc/nginx/sites-available/laporan-service
```
Isi:
```nginx
server {
    listen 80;
    server_name domainanda.com; # ganti dengan domain atau IP VPS Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Aktifkan dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/laporan-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ☁️ OPSI 3: Hosting Gratis / Cloud PaaS (Railway / Render)

Jika Anda ingin deploy langsung dari repository GitHub secara otomatis:

1. Buat akun di **Railway.app** atau **Render.com**.
2. Buat layanan database **MySQL** di dashboard Railway.
3. Hubungkan repository GitHub Anda (`Laporan-Service`).
4. Di bagian **Variables / Environment Variables**, masukkan:
   * `DB_HARDWARE_HOST`, `DB_HARDWARE_USER`, `DB_HARDWARE_PASSWORD`, `DB_HARDWARE_NAME`
   * `DB_CASING_HOST`, `DB_CASING_USER`, `DB_CASING_PASSWORD`, `DB_CASING_NAME`
   * `PORT` = `3000`
   *(Bisa juga pakai `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` bila kedua database memakai kredensial sama.)*
5. Klik **Deploy** ➔ Railway/Render akan otomatis melakukan `npm install` dan menjalankan `node server.js`.
6. Anda akan mendapatkan URL publik gratis seperti `https://laporan-service.up.railway.app`.

---

## 🔑 Akun Login Default
* **Teknisi Hardware:**
  * Username: `hardware`
  * Password: `hardware123`
* **Teknisi Casing:**
  * Username: `casing`
  * Password: `casing123`
