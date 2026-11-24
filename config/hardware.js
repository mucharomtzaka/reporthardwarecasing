// Konfigurasi database khusus user/teknisi HARDWARE (landing hardware_*).
// Override lewat env: DB_HARDWARE_HOST, DB_HARDWARE_USER, DB_HARDWARE_PASSWORD,
// DB_HARDWARE_PORT, DB_HARDWARE_NAME.
module.exports = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'laporan_hardware'
};
