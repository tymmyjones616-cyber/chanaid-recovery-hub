export type Tab = "overview" | "leads" | "loans" | "testimonials" | "site";

export type Lead = {
  id: string; firstName: string; lastName: string | null; email: string;
  phone: string | null; amountLost: string | null; scamType: string | null;
  message: string | null; status: string; sourcePage: string | null; createdAt: string;
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
  selfieImage: string | null; idFrontImage: string | null; idBackImage: string | null;
  passportFrontImage: string | null; passportBackImage: string | null;
  sourcePage: string | null; createdAt: string;
};

export type TestimonialSubmission = {
  id: string; clientName: string; email: string | null; location: string | null;
  scamType: string | null; amountRecovered: string | null; rating: number;
  quote: string; status: string; consentToPublish: boolean; createdAt: string;
};
