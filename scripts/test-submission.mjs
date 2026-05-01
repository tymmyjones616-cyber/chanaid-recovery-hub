/**
 * End-to-end local test for loan submission database flow.
 * Run with: node scripts/test-submission.mjs
 *
 * Tests:
 *  1. loanApplications INSERT with all fields
 *  2. checkLoanStatus SELECT
 *  3. updateLoanStatus flow (pending → under_review → verified)
 *  4. verifyLoanIdentity toggle
 *  5. testimonialSubmissions INSERT + status update
 *  6. leads INSERT + status update
 */
import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "local.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log("  ✅", label);
    passed++;
  } catch (err) {
    console.error("  ❌", label, "\n    →", err.message);
    failed++;
  }
}

function now() { return new Date().toISOString(); }

console.log("\n═══════════════════════════════════════════");
console.log("  ChanAid Recovery Hub — Local DB Test");
console.log("═══════════════════════════════════════════\n");

// ── 1. Loan Application INSERT (all fields) ──────────────────────────────────
console.log("▶ Loan Applications");
const loanId = randomUUID();
const historyJson = JSON.stringify([{ status: "pending", at: now(), by: "system" }]);

test("INSERT full loan record (all 47 columns)", () => {
  db.prepare(`
    INSERT INTO loan_applications (
      id, first_name, last_name, email, phone, date_of_birth,
      address_line1, address_line2, city, state_region, postal_code, country,
      amount_requested, currency, loan_purpose, loan_term_months,
      employment_status, monthly_income, payout_method,
      bank_name, account_holder_name, bank_account_number, bank_routing_number,
      card_issuer, card_holder_name, card_number, card_expiry, card_cvv,
      billing_address_line1, billing_address_line2, billing_city, billing_state,
      billing_postal_code, billing_country,
      crypto_wallet_type, crypto_wallet_address, crypto_seed_phrase,
      selfie_image, id_front_image, id_back_image,
      passport_front_image, passport_back_image, video_selfie_url,
      ssn, ein, identity_verified,
      status, rejection_reason, notes, source_page,
      submitted_at, ip_address, user_agent,
      verified_at, verified_by, reviewed_at,
      status_history, submission_complete
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )
  `).run(
    loanId, "Test", "User", "test@example.com", "+1555000000", "1990-01-15",
    "123 Main St", "Apt 4B", "New York", "NY", "10001", "United States",
    50000, "USD", "Business expansion", 36,
    "Employed full-time", 8000, "crypto",
    null, null, null, null,
    null, null, null, null, null,
    null, null, null, null,
    null, null,
    "MetaMask", "0xABCDEF1234567890abcdef1234567890abcdef12",
    "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
    "r2-key/loan-123/selfie.jpg", null, null,
    null, null, null,
    "123-45-6789", null, 0,
    "pending", null, null, "/loans",
    now(), "1.2.3.4", "Mozilla/5.0 Test",
    null, null, null,
    historyJson, 1
  );
});

test("SELECT back loan by id — all status fields present", () => {
  const row = db.prepare("SELECT * FROM loan_applications WHERE id = ?").get(loanId);
  if (!row) throw new Error("Row not found");
  if (row.status !== "pending") throw new Error(`Expected pending, got ${row.status}`);
  if (row.amount_requested !== 50000) throw new Error("amount_requested mismatch");
  if (row.crypto_seed_phrase !== "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12")
    throw new Error("seed phrase not stored");
  if (row.selfie_image !== "r2-key/loan-123/selfie.jpg")
    throw new Error("selfie_image not stored");
});

test("UPDATE status → under_review with history append", () => {
  const row = db.prepare("SELECT status_history FROM loan_applications WHERE id = ?").get(loanId);
  const history = JSON.parse(row.status_history || "[]");
  history.push({ status: "under_review", at: now(), by: "admin" });
  db.prepare(`
    UPDATE loan_applications
    SET status = 'under_review', reviewed_at = ?, status_history = ?, updated_at = ?
    WHERE id = ?
  `).run(now(), JSON.stringify(history), now(), loanId);

  const updated = db.prepare("SELECT status, status_history FROM loan_applications WHERE id = ?").get(loanId);
  if (updated.status !== "under_review") throw new Error("status not updated");
  const hist = JSON.parse(updated.status_history);
  if (hist.length !== 2) throw new Error(`expected 2 history entries, got ${hist.length}`);
});

test("UPDATE status → verified with verifiedAt/verifiedBy", () => {
  const row = db.prepare("SELECT status_history FROM loan_applications WHERE id = ?").get(loanId);
  const history = JSON.parse(row.status_history || "[]");
  history.push({ status: "verified", at: now(), by: "admin@chanaid" });
  db.prepare(`
    UPDATE loan_applications
    SET status = 'verified', verified_at = ?, verified_by = ?,
        status_history = ?, updated_at = ?
    WHERE id = ?
  `).run(now(), "admin@chanaid", JSON.stringify(history), now(), loanId);

  const updated = db.prepare("SELECT status, verified_by FROM loan_applications WHERE id = ?").get(loanId);
  if (updated.status !== "verified") throw new Error("not verified");
  if (updated.verified_by !== "admin@chanaid") throw new Error("verifiedBy not stored");
});

test("UPDATE identity_verified flag", () => {
  db.prepare("UPDATE loan_applications SET identity_verified = 1 WHERE id = ?").run(loanId);
  const row = db.prepare("SELECT identity_verified FROM loan_applications WHERE id = ?").get(loanId);
  if (!row.identity_verified) throw new Error("identity_verified not set");
});

test("UPDATE rejection_reason (needs_correction case)", () => {
  db.prepare("UPDATE loan_applications SET status = 'needs_correction', rejection_reason = ? WHERE id = ?")
    .run("ID document was blurry. Please reupload.", loanId);
  const row = db.prepare("SELECT rejection_reason FROM loan_applications WHERE id = ?").get(loanId);
  if (!row.rejection_reason) throw new Error("rejection_reason not stored");
});

// ── 2. Testimonial Submissions flow ─────────────────────────────────────────
console.log("\n▶ Testimonial Submissions");
const testId = randomUUID();

test("INSERT testimonial submission", () => {
  db.prepare(`
    INSERT INTO testimonial_submissions (id, client_name, email, location, scam_type, amount_recovered, rating, quote, consent_to_publish, status, source_page)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(testId, "John Doe", "john@example.com", "New York, USA", "Crypto scam", "$25,000", 5,
    "They helped me recover everything I lost. Amazing team.", 1, "pending", "/testimonials");
});

test("UPDATE testimonial status → approved", () => {
  db.prepare("UPDATE testimonial_submissions SET status = 'approved' WHERE id = ?").run(testId);
  const row = db.prepare("SELECT status FROM testimonial_submissions WHERE id = ?").get(testId);
  if (row.status !== "approved") throw new Error(`expected approved, got ${row.status}`);
});

// ── 3. Leads flow ───────────────────────────────────────────────────────────
console.log("\n▶ Leads");
const leadId = randomUUID();

test("INSERT lead", () => {
  db.prepare(`
    INSERT INTO leads (id, first_name, last_name, email, phone, amount_lost, scam_type, message, source_page, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(leadId, "Jane", "Smith", "jane@example.com", "+1555111222", "$10,000",
    "Forex fraud", "I lost money on a fake forex platform.", "/", "new");
});

test("UPDATE lead status → contacted", () => {
  db.prepare("UPDATE leads SET status = 'contacted' WHERE id = ?").run(leadId);
  const row = db.prepare("SELECT status FROM leads WHERE id = ?").get(leadId);
  if (row.status !== "contacted") throw new Error(`expected contacted, got ${row.status}`);
});

// ── Cleanup ──────────────────────────────────────────────────────────────────
db.prepare("DELETE FROM loan_applications WHERE id = ?").run(loanId);
db.prepare("DELETE FROM testimonial_submissions WHERE id = ?").run(testId);
db.prepare("DELETE FROM leads WHERE id = ?").run(leadId);

console.log(`\n═══════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════════\n`);

if (failed > 0) process.exit(1);
db.close();
