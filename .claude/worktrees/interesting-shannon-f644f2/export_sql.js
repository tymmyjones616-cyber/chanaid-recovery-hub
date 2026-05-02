
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('local.db');

function exportToSql() {
  const tables = ['services', 'testimonials', 'blog_posts', 'faqs', 'pages'];
  let sql = "";

  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) continue;

    sql += `-- Data for ${table}\n`;
    for (const row of rows) {
      const keys = Object.keys(row);
      const values = keys.map(k => {
        const val = row[k];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      sql += `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    sql += "\n";
  }

  fs.writeFileSync('seed_production.sql', sql);
  console.log('✅ seed_production.sql generated.');
}

exportToSql();
