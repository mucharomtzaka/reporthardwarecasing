const assert = require('assert');
const fs = require('fs');
const path = require('path');

const read = name => fs.readFileSync(path.join(__dirname, '..', 'database', name), 'utf8');
const hw = read('hardware.sql');
const cs = read('casing.sql');

assert.ok(hw.includes('laporan_hardware') && !hw.includes('laporan_casing'));
assert.ok(cs.includes('laporan_casing') && !cs.includes('laporan_hardware'));
['hp_', 'alat_', 'rusak_'].forEach(p => assert.ok(hw.includes('`' + p), p));
['admin_', 'paket_'].forEach(p => assert.ok(cs.includes('`' + p), p));

console.log('OK: schema hardware dan casing terpisah.');
