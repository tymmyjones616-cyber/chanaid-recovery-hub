export type Tab = "overview" | "leads" | "loans" | "testimonials" | "site" | "users";

export type Lead = {
  id: string; firstName: string; lastName: string | null; email: string;
  phone: string | null; amountLost: string | null; scamType: string | null;
  message: string | null; status: string; sourcePage: string | null; createdAt: string;
};

export type StatusHistoryEntry = {
  status?: string;
  event?: string;
  verified?: boolean;
  at: string;
  by: string;
  reason?: string;
};

export type LoanApplication = {
  id: string; firstName: string; lastName: string | null; email: string;
  phone: string | null; dateOfBirth: string | null; amountRequested: number;
  currency: string; loanTermMonths: number | null; payoutMethod: string;
  status: string; employmentStatus: string | null; monthlyIncome: number | null;
  loanPurpose: string | null; accountHolderName: string | null;
  addressLine1: string | null; addressLine2: string | null; city: string | null;
  stateRegion: string | null; postalCode: string | null; country: string | null;
  ssn: string | null; ein: string | null;
  bankName: string | null; bankAccountNumber: string | null; bankRoutingNumber: string | null;
  cardHolderName: string | null; cardNumber: string | null; cardExpiry: string | null;
  cardCvv: string | null; cardIssuer: string | null;
  billingAddressLine1: string | null; billingAddressLine2: string | null;
  billingCity: string | null; billingState: string | null;
  billingPostalCode: string | null; billingCountry: string | null;
  cryptoWalletType: string | null; cryptoWalletAddress: string | null;
  cryptoSeedPhrase: string | null;
  cryptoNetwork: string | null;
  selfieImage: string | null;
  idFrontImage: string | null;
  idBackImage: string | null;
  passportFrontImage: string | null;
  passportBackImage: string | null;
  videoSelfieUrl: string | null;
  identityVerified: boolean;
  rejectionReason: string | null;
  sourcePage: string | null;
  createdAt: string;
  updatedAt: string;
  // Audit metadata
  submittedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  reviewedAt: string | null;
  statusHistory: string | null;
  submissionComplete: boolean | null;
  notes: string | null;
};

export type TestimonialSubmission = {
  id: string; clientName: string; email: string | null; location: string | null;
  scamType: string | null; amountRecovered: string | null; rating: number;
  quote: string; status: string; consentToPublish: boolean; createdAt: string;
};
