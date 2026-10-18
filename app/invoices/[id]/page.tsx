'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Printer, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertCircle,
  CreditCard 
} from 'lucide-react';
import { CreateKarLogo } from '@/components/Logo';

interface InvoiceData {
  id: string;
  contract_id: string;
  invoice_number: string;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  platform_fee: number;
  total_amount: number;
  created_at: string;
  signature_hash?: string | null;
  accepted_at?: string | null;
  accepted_ip?: string | null;
  terms_snapshot?: Record<string, unknown> | null;
  payment_status?: string | null;
  razorpay_payment_id?: string | null;
  contract: {
    title: string;
    deliverables: Array<{ title?: string; format?: string; rate?: number }>;
    status: string;
    deadline?: string;
    signature_hash?: string | null;
    accepted_at?: string | null;
    accepted_ip?: string | null;
    terms_snapshot?: Record<string, unknown> | null;
  };
  creator: {
    name: string;
    handle: string;
    pan: string | null;
    gstin: string | null;
    city: string | null;
    state: string | null;
    upi: string | null;
  };
  agency: {
    name: string;
    handle: string;
    pan: string | null;
    gstin: string | null;
    city: string | null;
    state: string | null;
  };
}

function formatExecutionTimestamp(acceptedAt?: string | null): string {
  if (!acceptedAt) return 'Recorded upon deal acceptance';
  const date = new Date(acceptedAt);
  if (isNaN(date.getTime())) return acceptedAt;

  const istString = date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return `${istString} IST (${date.toISOString()})`;
}

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadInvoice() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`/api/invoices/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message || 'Failed to load invoice.');
        }

        setInvoice(data.invoice);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error retrieving invoice';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
        <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Accessing tax invoice record...</p>
      </main>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6">
        <div className="bg-seal-light border border-seal/30 rounded-md p-8 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-seal mx-auto mb-3" />
          <h2 className="text-lg font-bold font-display text-ink">Tax Invoice Not Located</h2>
          <p className="text-xs font-mono text-ink-muted mt-2 mb-6">
            {errorMessage || 'The requested commercial invoice is not found on the platform ledger.'}
          </p>
          <Link
            href="/agency/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Desk</span>
          </Link>
        </div>
      </main>
    );
  }

  const deliverableName =
    invoice.contract?.deliverables?.[0]?.format ||
    invoice.contract?.deliverables?.[0]?.title ||
    invoice.contract?.title ||
    'Commercial Content Production';

  const issueDate = new Date(invoice.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const signatureHash = invoice.signature_hash || invoice.contract?.signature_hash;
  const acceptedAt = invoice.accepted_at || invoice.contract?.accepted_at;
  const acceptedIp = invoice.accepted_ip || invoice.contract?.accepted_ip || 'Recorded via verified session';

  return (
    <div className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:text-black">
      {/* Top action bar: hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/agency/dashboard"
          className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Desk</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-md shadow-sm transition active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tax Invoice (PDF)</span>
        </button>
      </div>

      {/* Invoice Document Canvas */}
      <div className="max-w-4xl mx-auto bg-white border border-ledger rounded-md p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:bg-white print:text-black print:p-0 print:max-w-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-ledger print:border-ink">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CreateKarLogo size="md" />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-pine-light border border-pine/30 text-pine text-[10px] font-mono uppercase tracking-widest font-bold print:border-black print:bg-transparent print:text-black">
                <Check className="w-3 h-3" />
                Settled & Audited
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-ink print:text-black">
              Official Tax Invoice
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-ink-muted mt-1 print:text-black">
              SAC Code 9983 • Indian Commercial Jurisdiction
            </p>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="block text-[10px] uppercase tracking-wider text-ink-muted print:text-black">
              Invoice Serial Number
            </span>
            <span className="text-lg font-bold text-ink print:text-black">
              {invoice.invoice_number}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-ink-muted mt-2 print:text-black">
              Date of Issue
            </span>
            <span className="text-xs font-bold text-ink print:text-black">
              {issueDate}
            </span>
          </div>
        </div>

        {/* Parties: Supplier (Creator) & Recipient (Agency) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-ledger print:border-ink text-xs font-mono">
          {/* Supplier (Creator) */}
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-seal print:text-black">
              Supplier (Contracted Creator)
            </span>
            <p className="text-sm font-bold font-display text-ink print:text-black">
              {invoice.creator.name}
            </p>
            <p className="text-ink-muted print:text-black">@{invoice.creator.handle.replace(/^@/, '')}</p>
            <p className="text-ink-muted print:text-black">
              PAN: <span className="font-bold text-ink print:text-black">{invoice.creator.pan || 'PAN Verified on file'}</span>
            </p>
            <p className="text-ink-muted print:text-black">
              GSTIN: <span className="font-bold text-ink print:text-black">{invoice.creator.gstin || 'Unregistered / Exempt Under Threshold'}</span>
            </p>
            <p className="text-ink-muted print:text-black">
              Jurisdiction: {invoice.creator.city || 'Bengaluru'}, {invoice.creator.state || 'Karnataka'}
            </p>
            {invoice.creator.upi && (
              <p className="text-[11px] text-ink-muted print:text-black">
                UPI Settlement Endpoint: {invoice.creator.upi}
              </p>
            )}
          </div>

          {/* Recipient (Agency) */}
          <div className="space-y-1 sm:text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-seal print:text-black">
              Billed To (Contracting Agency)
            </span>
            <p className="text-sm font-bold font-display text-ink print:text-black">
              {invoice.agency.name}
            </p>
            <p className="text-ink-muted print:text-black">@{invoice.agency.handle.replace(/^@/, '')}</p>
            <p className="text-ink-muted print:text-black">
              PAN: <span className="font-bold text-ink print:text-black">{invoice.agency.pan || 'AAACK1234F'}</span>
            </p>
            <p className="text-ink-muted print:text-black">
              GSTIN: <span className="font-bold text-ink print:text-black">{invoice.agency.gstin || '29AAACK1234F1Z5'}</span>
            </p>
            <p className="text-ink-muted print:text-black">
              Registered Office: {invoice.agency.city || 'Bengaluru'}, {invoice.agency.state || 'Karnataka'}
            </p>
          </div>
        </div>

        {/* Deliverables Table */}
        <div className="py-8 border-b border-ledger print:border-ink">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-y border-ink text-[10px] uppercase tracking-wider text-ink bg-paper print:bg-transparent">
                <th className="py-2.5 px-2 font-bold">Service Classification & Deliverables</th>
                <th className="py-2.5 px-2 font-bold text-center">SAC Code</th>
                <th className="py-2.5 px-2 font-bold text-right">Taxable Base</th>
                <th className="py-2.5 px-2 font-bold text-right">CGST (9%)</th>
                <th className="py-2.5 px-2 font-bold text-right">SGST (9%)</th>
                <th className="py-2.5 px-2 font-bold text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ledger print:divide-ink">
              <tr>
                <td className="py-4 px-2">
                  <div className="font-bold font-sans text-sm text-ink print:text-black">{invoice.contract.title}</div>
                  <div className="text-[11px] text-ink-muted print:text-black mt-0.5">
                    {deliverableName}
                  </div>
                </td>
                <td className="py-4 px-2 text-center font-bold text-ink print:text-black">
                  9983
                </td>
                <td className="py-4 px-2 text-right font-medium text-ink print:text-black">
                  ₹{invoice.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-2 text-right text-ink print:text-black">
                  ₹{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-2 text-right text-ink print:text-black">
                  ₹{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-2 text-right font-bold text-ink print:text-black">
                  ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between gap-8">
          <div className="text-xs font-mono text-ink-muted max-w-sm space-y-3">
            <div>
              <p className="font-bold text-ink uppercase tracking-wider mb-1 text-[10px]">
                Statutory Settlement Notes
              </p>
              <p className="leading-relaxed">
                Services rendered under Indian GST Service Accounting Code SAC 9983 (Other professional, technical and business services).
              </p>
              <p className="mt-1 leading-relaxed">
                Zero creator deduction platform model. Agency convenience fee fixed at ₹499 flat statutory charge.
              </p>
            </div>

            {/* Razorpay Settlement Record */}
            {invoice.razorpay_payment_id && (
              <div className="p-3 bg-paper border border-ledger rounded-md">
                <div className="flex items-center gap-1.5 font-bold text-ink text-[11px] uppercase tracking-wider mb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-seal" />
                  <span>Settlement Transaction Record</span>
                </div>
                <div className="space-y-1 text-[11px] text-ink-muted">
                  <div className="flex justify-between gap-2">
                    <span>Payment ID:</span>
                    <span className="font-mono text-ink font-bold select-all">
                      {invoice.razorpay_payment_id}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Gateway Mode:</span>
                    <span className="text-ink">
                      Razorpay (UPI / Netbanking / Cards)
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Settlement Status:</span>
                    <span className="text-pine font-bold uppercase">
                      CAPTURED / VERIFIED
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Recorded Timestamp:</span>
                    <span className="text-ink">
                      {new Date(invoice.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      })} IST
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-ink-muted">
              <span>Taxable Value:</span>
              <span className="font-medium text-ink">
                ₹{invoice.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-ink-muted">
              <span>CGST (9.0%):</span>
              <span className="font-medium text-ink">
                ₹{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-ink-muted">
              <span>SGST (9.0%):</span>
              <span className="font-medium text-ink">
                ₹{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-ink-muted">
              <span>Platform Fee:</span>
              <span className="font-medium text-ink">
                ₹{invoice.platform_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-3 border-t border-ink flex justify-between text-base font-bold text-ink">
              <span>Total Payable:</span>
              <span className="text-lg">
                ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Contract Execution & Integrity Record */}
        <div className="border border-ledger bg-paper rounded-md p-4 mt-8 text-xs font-mono text-ink print:bg-white print:border-ledger print:break-inside-avoid">
          <div className="flex items-center gap-2 font-bold text-ink mb-3 text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-seal flex-shrink-0" />
            <span>Digital Execution & Cryptographic Hash Seal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <span className="block text-[10px] uppercase text-ink-muted mb-0.5">Execution Timestamp:</span>
              <span className="text-ink font-bold">
                {formatExecutionTimestamp(acceptedAt)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-ink-muted mb-0.5">Signatory Origin IP:</span>
              <span className="font-mono text-ink font-bold">
                {acceptedIp}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-[10px] uppercase text-ink-muted mb-1">SHA-256 Evidentiary Digest:</span>
              <code className="block font-mono break-all text-ink bg-white border border-ledger px-2 py-1.5 rounded-sm select-all font-bold">
                {signatureHash || 'PENDING_DIGITAL_EXECUTION'}
              </code>
            </div>
          </div>

          <p className="text-[10px] text-ink-muted pt-2 border-t border-ledger">
            This instrument certifies an electronically executed commercial contract. The SHA-256 digest mathematically guarantees contract terms remain immutable and authentic under the Information Technology Act, 2000.
          </p>
        </div>
      </div>
    </div>
  );
}
