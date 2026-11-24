const assert = require('assert');
const db = require('../db');

const cfg = db.getDbConfig();
assert.strictEqual(cfg.configs.hardware.database, 'laporan_hardware');
assert.strictEqual(cfg.configs.casing.database, 'laporan_casing');

const hardwareBefore = db.getParentConfig('hardware_hp');
process.env.DB_CASING_USER = 'casing_user';
process.env.DB_CASING_NAME = 'laporan_casing_test';
assert.strictEqual(db.getParentConfig('casing_paket').user, 'casing_user');
assert.strictEqual(db.getParentConfig('casing_paket').database, 'laporan_casing_test');
assert.deepStrictEqual(db.getParentConfig('hardware_hp'), hardwareBefore);
delete process.env.DB_CASING_USER;
delete process.env.DB_CASING_NAME;

console.log('OK: konfigurasi hardware dan casing terpisah.');
