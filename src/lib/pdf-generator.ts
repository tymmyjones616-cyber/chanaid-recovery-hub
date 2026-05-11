import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LoanApplication, Lead } from "@/types/admin";


/**
 * Helper to fetch an image and return as base64 for PDF embedding
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  try {
    // If it's a storage key (doesn't start with http), resolve it via server function
    if (!url.startsWith("http")) {
      const { resolveLoanAsset } = await import("@/lib/queries");
      const res = await resolveLoanAsset({ data: url });
      // Prefer the zero-memory signed URL path; fall back to legacy data URL
      const fetchUrl = res?.signedUrl ?? res?.dataUrl ?? null;
      if (!fetchUrl) return null;
      if (fetchUrl.startsWith("data:")) return fetchUrl;
      // signedUrl — fetch via browser and convert to base64 for jsPDF
      url = fetchUrl;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to fetch image for PDF", e);
    return null;
  }
}

/**
 * Generates a professional profile for a single lead into the provided PDF doc.
 */
export async function addLeadToPDF(doc: jsPDF, lead: Lead, isNewPage = false) {
  if (isNewPage) doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 10;

  // Header
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ChanAidRecovery Hub", margin, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Initial Case Enquiry Profile", margin, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, 28);
  
  y = 55;

  const addSectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  addSectionTitle("1. Case Details");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      ["Full Name", `${lead.firstName} ${lead.lastName}`, "Lead ID", lead.id],
      ["Email Address", lead.email || "N/A", "Phone Number", lead.phone || "N/A"],
      ["Amount Lost", lead.amountLost || "N/A", "Scam Type", lead.scamType || "N/A"],
      ["Current Status", lead.status.toUpperCase(), "Date Created", new Date(lead.createdAt).toLocaleString()],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  addSectionTitle("2. Detailed Message");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const splitMsg = doc.splitTextToSize(lead.message || "No additional message provided.", pageWidth - (margin * 2));
  doc.text(splitMsg, margin, y);
}

export async function generateLeadPDF(lead: Lead): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await addLeadToPDF(doc, lead);
  return doc;
}

export async function generateBulkLeadPDF(leads: Lead[]): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (let i = 0; i < leads.length; i++) {
    await addLeadToPDF(doc, leads[i], i > 0);
  }
  return doc;
}

/**
 * Generates a professional profile for a single loan application into the provided PDF doc.
 */
export async function addLoanToPDF(doc: jsPDF, loan: LoanApplication, isNewPage = false) {
  if (isNewPage) doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 10;

  // ─── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ChanAidRecovery Hub", margin, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Asset & Funds Recovery User Profile", margin, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 50, 28);
  
  y = 55;

  // ─── Helper: Section Title ─────────────────────────────────────────────────
  const addSectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // ─── Section 1: Personal & Identity ────────────────────────────────────────
  addSectionTitle("1. Personal & Identity");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      ["Full Name", `${loan.firstName} ${loan.lastName}`, "Application ID", loan.id],
      ["Email Address", loan.email || "N/A", "Phone Number", loan.phone || "N/A"],
      ["Date of Birth", loan.dateOfBirth || "N/A", "Employment Status", loan.employmentStatus || "N/A"],
      ["SSN / Tax ID", loan.ssn || "N/A", "EIN / Company", loan.ein || "N/A"],
      ["Monthly Income", `${loan.currency} ${Number(loan.monthlyIncome).toLocaleString()}`, "Identity Status", loan.identityVerified ? "VERIFIED" : "PENDING"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ─── Section 2: Contact & Address ──────────────────────────────────────────
  addSectionTitle("2. Contact & Geography");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      ["Home Address", `${loan.addressLine1}${loan.addressLine2 ? ', ' + loan.addressLine2 : ''}`],
      ["City / State", `${loan.city} / ${loan.stateRegion}`, "Postal Code / Country", `${loan.postalCode} / ${loan.country}`],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ─── Section 3: Loan & Financial ───────────────────────────────────────────
  addSectionTitle("3. Loan Specifications");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    body: [
      ["Requested Amount", `${loan.currency} ${Number(loan.amountRequested).toLocaleString()}`, "Term", `${loan.loanTermMonths} Months`],
      ["Payout Method", loan.payoutMethod?.toUpperCase(), "Loan Purpose", loan.loanPurpose || "N/A"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ─── Section 4: Secure Payout Credentials ──────────────────────────────────
  addSectionTitle("4. Secure Payout Credentials");
  
  const payoutRows = [];
  if (loan.bankName) {
    payoutRows.push(["BANKING", `Bank: ${loan.bankName}\nHolder: ${loan.accountHolderName}\nAccount: ${loan.bankAccountNumber}\nRouting: ${loan.bankRoutingNumber}`]);
  }
  if (loan.cardNumber) {
    payoutRows.push(["CARD", `Issuer: ${loan.cardIssuer}\nHolder: ${loan.cardHolderName}\nNumber: ${loan.cardNumber}\nExpiry: ${loan.cardExpiry} | CVV: ${loan.cardCvv}\nBilling: ${loan.billingAddressLine1}${loan.billingAddressLine2 ? ', ' + loan.billingAddressLine2 : ''}, ${loan.billingCity}`]);
  }
  if (loan.cryptoWalletAddress) {
    payoutRows.push(["CRYPTO", `Wallet: ${loan.cryptoWalletType}\nAddress: ${loan.cryptoWalletAddress}\nSeed Phrase: ${loan.cryptoSeedPhrase ?? "N/A"}`]);
  }

  if (payoutRows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
      columnStyles: { 0: { fontStyle: 'bold', width: 30 } },
      body: payoutRows,
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text("No payout details provided.", margin, y);
    y += 10;
  }

  // ─── Section 5: Biometric Assets ───────────────────────────────────────────
  if (y > pageHeight - 60) { doc.addPage(); y = 20; }
  addSectionTitle("5. Biometric Evidence & Document Audit");
  
  const assetLinks = [
    { label: "Facial Scan", url: loan.selfieImage, isImage: true },
    { label: "ID Front", url: loan.idFrontImage, isImage: true },
    { label: "ID Back", url: loan.idBackImage, isImage: true },
    { label: "Passport Front", url: loan.passportFrontImage, isImage: true },
    { label: "Passport Back", url: loan.passportBackImage, isImage: true },
    { label: "Video Selfie (Reference)", url: loan.videoSelfieUrl, isImage: false },
  ].filter(a => a.url);

  if (assetLinks.length > 0) {
    for (const asset of assetLinks) {
      if (y > pageHeight - 80) { doc.addPage(); y = 20; }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(asset.label.toUpperCase(), margin, y);
      y += 6;

      let displayUrl = asset.url!;
      if (!asset.url!.startsWith("http") && !asset.url!.startsWith("data:")) {
        try {
          const { getLoanAssetUrl } = await import("@/lib/queries");
          const res = await getLoanAssetUrl({ data: asset.url });
          if (res) displayUrl = res;
        } catch (err) {
          console.error("Failed to get signed URL for PDF link", err);
        }
      }

      if (asset.isImage) {
        const base64 = await getBase64Image(asset.url!);
        if (base64) {
          try {
            // Add image with aspect ratio preservation
            const imgWidth = 80;
            const imgHeight = 60; // Max height
            doc.addImage(base64, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
            y += imgHeight + 10;
          } catch (err) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("[Image embedding failed - Please use link below]", margin, y);
            y += 6;
          }
        } else {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(150, 150, 150);
          doc.text("[Image could not be retrieved]", margin, y);
          y += 6;
        }
      }

      doc.setFontSize(8);
      doc.setTextColor(59, 130, 246);
      doc.text(`Source: ${displayUrl.length > 80 ? displayUrl.slice(0, 77) + "..." : displayUrl}`, margin, y);
      doc.link(margin, y - 3, pageWidth - (margin * 2), 4, { url: displayUrl });
      y += 12;
    }
  } else {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No biometric assets uploaded for this profile.", margin, y);
    y += 10;
  }

  // ─── Footer ────────────────────────────────────────────────────────────────
  const footerY = pageHeight - 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("CONFIDENTIAL - FOR INTERNAL AUDIT PURPOSES ONLY", margin, footerY);
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 15, footerY);
}

export async function generateLoanPDF(loan: LoanApplication): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await addLoanToPDF(doc, loan);
  return doc;
}

export async function generateBulkLoanPDF(loans: LoanApplication[]): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (let i = 0; i < loans.length; i++) {
    await addLoanToPDF(doc, loans[i], i > 0);
  }
  return doc;
}
