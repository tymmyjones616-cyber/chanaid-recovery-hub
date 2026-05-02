const Database = require('better-sqlite3');
const db = new Database('local.db');
const total = db.prepare('SELECT COUNT(*) as c FROM testimonials').get();
const uq = db.prepare('SELECT COUNT(DISTINCT quote) as c FROM testimonials').get();
const un = db.prepare('SELECT COUNT(DISTINCT client_name) as c FROM testimonials').get();
const types = db.prepare('SELECT scam_type, COUNT(*) as c FROM testimonials GROUP BY scam_type').all();
const svcs = db.prepare('SELECT name, icon FROM services ORDER BY sort_order').all();
const result = { total: total.c, uq: uq.c, un: un.c, types, svcs };
require('fs').writeFileSync('verify_out.json', JSON.stringify(result, null, 2));
