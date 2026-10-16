/**
 * CreateKar - Core Database Schema Types
 * Matches the PostgreSQL schema for profiles, contracts, deliverables, and invoices.
 */

export type UserRole = 'creator' | 'agency' | 'admin';

export type ContractStatus = 
  | 'DRAFT'
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'FUNDED'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'DISPUTED';

export type DeliverableStatus = 
  | 'PENDING'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'APPROVED';

export interface ContractDeliverableItem {
  id?: string;
  title: string;
  format: string;
  description?: string;
  quantity?: number;
  rate?: number;
}

export interface Profile {
  id: string;
  user_id?: string;
  email?: string | null;
  password_hash?: string | null;
  role?: UserRole;
  display_name: string;
  handle: string;
  bio: string | null;
  niche: string | null;
  avatar_url: string | null;
  starting_rate: number;
  upi_id?: string | null;
  pan_number?: string | null;
  gstin?: string | null;
  city?: string | null;
  state?: string | null;
  is_verified?: boolean;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'creator' | 'agency' | 'admin';
  display_name: string;
}

export interface Contract {
  id: string;
  agency_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  deliverables: ContractDeliverableItem[];
  total_amount: number;
  platform_fee: number;
  status: ContractStatus;
  deadline: string | null;
  accepted_at?: string | null;
  accepted_ip?: string | null;
  accepted_user_agent?: string | null;
  signature_hash?: string | null;
  terms_snapshot?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  contract_id: string;
  title: string;
  format: string;
  file_url: string | null;
  preview_url: string | null;
  status: DeliverableStatus;
  revision_notes: string | null;
  updated_at: string;
}

export interface Invoice {
  id: string;
  contract_id: string;
  invoice_number: string;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  platform_fee: number;
  total_amount: number;
  pdf_url: string | null;
  created_at: string;
}

export interface InvoiceWithAudit extends Invoice {
  contract_title?: string;
  signature_hash?: string | null;
  accepted_at?: string | null;
  accepted_ip?: string | null;
  terms_snapshot?: Record<string, unknown> | null;
}

/**
 * Input DTO types for creation and updates
 */
export type CreateProfileInput = Omit<Profile, 'id' | 'is_verified' | 'created_at'> & {
  is_verified?: boolean;
};

export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>;

export type CreateContractInput = Omit<Contract, 'id' | 'platform_fee' | 'created_at' | 'updated_at'> & {
  platform_fee?: number;
};

export type UpdateContractInput = Partial<Omit<Contract, 'id' | 'agency_id' | 'creator_id' | 'created_at' | 'updated_at'>>;

export type CreateDeliverableInput = Omit<Deliverable, 'id' | 'updated_at'>;

export type UpdateDeliverableInput = Partial<Omit<Deliverable, 'id' | 'contract_id' | 'updated_at'>>;

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at'>;

/**
 * Standard typed response structure to enforce strict error handling
 * without silent error swallowing.
 */
export type DbResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

export interface ContractWithDetails extends Contract {
  creator_name: string;
  creator_handle: string;
  invoice_id: string | null;
  invoice_number: string | null;
}

export interface AdminMetrics {
  totalVolume: number;
  totalPlatformRevenue: number;
  activeDealsCount: number;
  completedDealsCount: number;
  verifiedCreatorsCount?: number;
}

export interface DashboardContract extends Contract {
  creator_name?: string;
  creator_handle?: string;
  creator_avatar?: string;
  agency_name?: string;
  revision_notes?: string | null;
  deliverable_status?: DeliverableStatus | null;
  last_submitted_url?: string | null;
  submitted_deliverables?: Deliverable[];
}


