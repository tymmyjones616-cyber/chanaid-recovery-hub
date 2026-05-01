/**
 * Sets up local.db for development by applying all pending schema changes.
 * Run with: node scripts/setup-local-db.mjs
 */
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const db = new Database(join(root, "local.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function runMigration(label, sql) {
  console.log(`\n▶ ${label}`);
  const statements = sql
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      db.exec(stmt);
      console.log("  ✓", stmt.slice(0, 80).replace(/\n/g, " "));
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("duplicate column")) {
        console.log("  ⚠ (already applied):", err.message.slice(0, 80));
      } else {
        throw err;
      }
    }
  }
}

// Migration 0000 — initial schema
const m0 = readFileSync(join(root, "drizzle/0000_tough_union_jack.sql"), "utf8");
runMigration("0000_tough_union_jack", m0);

// Migration 0001 — loan audit columns
const m1 = readFileSync(join(root, "drizzle/0001_loan_audit_columns.sql"), "utf8");
runMigration("0001_loan_audit_columns", m1);

// Add any columns that may have been added in schema but not yet migrated
const extraCols = [
  `ALTER TABLE loan_applications ADD COLUMN card_holder_name TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN card_number TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN card_expiry TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN card_cvv TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_address_line1 TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_address_line2 TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_city TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_state TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_postal_code TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN billing_country TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN bank_account_number TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN bank_routing_number TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN ssn TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN ein TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN crypto_wallet_type TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN crypto_wallet_address TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN crypto_seed_phrase TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN selfie_image TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN id_front_image TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN id_back_image TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN passport_front_image TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN passport_back_image TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN video_selfie_url TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN identity_verified INTEGER DEFAULT 0`,
  `ALTER TABLE loan_applications ADD COLUMN rejection_reason TEXT`,
  `ALTER TABLE loan_applications ADD COLUMN notes TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN likes INTEGER DEFAULT 0`,
  `ALTER TABLE testimonial_submissions ADD COLUMN notes TEXT`,
];

console.log("\n▶ extra schema columns");
for (const sql of extraCols) {
  try {
    db.exec(sql);
    console.log("  ✓", sql.slice(0, 80));
  } catch (err) {
    if (err.message.includes("duplicate column")) {
      console.log("  ⚠ (already exists)");
    } else {
      console.error("  ✗ ERROR:", err.message, "|", sql);
    }
  }
}

console.log("\n✅ local.db is up to date.\n");
db.close();
