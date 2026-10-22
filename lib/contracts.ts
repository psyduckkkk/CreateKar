import crypto from "crypto";

export type SignatureMethod = "SHA256_CRYPTOGRAPHIC" | "AADHAAR_ESIGN_OPT_IN";

export type TdsSection = "NONE" | "194C_1PCT" | "194C_2PCT" | "194J_2PCT" | "194J_10PCT";

export interface ContractCalculationParams {
  grossAmountInr: number;
  tdsSection: TdsSection;
  agencyTan?: string;
  isGstApplicable?: boolean;
}

export interface ContractCalculationResult {
  grossAmountInr: number;
  tdsRatePercent: number;
  tdsAmountInr: number;
  netPayableToCreatorInr: number;
  gstAmountInr: number;
  totalAgencyEscrowInr: number;
  tdsSection: TdsSection;
  tdsNote: string;
}

/**
 * Calculates TDS deduction for agency transactions under Indian Income Tax Act.
 */
export function calculateContractTds({
  grossAmountInr,
  tdsSection,
  isGstApplicable = false,
}: ContractCalculationParams): ContractCalculationResult {
  let tdsRatePercent = 0;
  let tdsNote = "No TDS deducted on this transaction.";

  switch (tdsSection) {
    case "194C_1PCT":
      tdsRatePercent = 1;
      tdsNote = "Section 194C (1% TDS for Individual / Sole Proprietor Creator).";
      break;
    case "194C_2PCT":
      tdsRatePercent = 2;
      tdsNote = "Section 194C (2% TDS for Company / LLP / Partnership Creator).";
      break;
    case "194J_2PCT":
      tdsRatePercent = 2;
      tdsNote = "Section 194J (2% TDS for Technical Content Services).";
      break;
    case "194J_10PCT":
      tdsRatePercent = 10;
      tdsNote = "Section 194J (10% TDS for Professional & Creative Endorsement Fees).";
      break;
    case "NONE":
    default:
      tdsRatePercent = 0;
      tdsNote = "No TDS withheld. Transaction below statutory threshold or exempt.";
      break;
  }

  // TDS is deducted on base value exclusive of GST as per CBDT Circular No. 23/2017
  const tdsAmountInr = Math.round((grossAmountInr * tdsRatePercent) / 100);
  const netPayableToCreatorInr = grossAmountInr - tdsAmountInr;
  const gstAmountInr = isGstApplicable ? Math.round(grossAmountInr * 0.18) : 0;
  const totalAgencyEscrowInr = netPayableToCreatorInr + gstAmountInr;

  return {
    grossAmountInr,
    tdsRatePercent,
    tdsAmountInr,
    netPayableToCreatorInr,
    gstAmountInr,
    totalAgencyEscrowInr,
    tdsSection,
    tdsNote,
  };
}

/**
 * Generates an immutable SHA-256 cryptographic digest of the contract.
 * Default regulatory record under Information Technology Act, 2000 (Section 10A).
 */
export function generateContractSha256Digest(contractData: {
  contractId: string;
  brandId: string;
  creatorId: string;
  title: string;
  deliverables: Array<{ type: string; deadline: string }>;
  grossAmountInr: number;
  tdsDetails: { section: string; amount: number };
  createdAt: string;
}): string {
  const serialized = JSON.stringify(contractData, Object.keys(contractData).sort());
  return crypto.createHash("sha256").update(serialized, "utf8").digest("hex");
}
