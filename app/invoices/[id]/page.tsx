'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Printer, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

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
  contract: {
    title: string;
    deliverables: Array<{ title?: string; format?: string; rate?: number }>;
    status: string;
    deadline?: string;
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
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading commercial invoice...</p>
      </main>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Invoice Not Found</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            {errorMessage || 'The requested commercial invoice is not available.'}
          </p>
          <Link
            href="/agency/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:text-black">
      {/* Top action bar: hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/agency/dashboard"
          className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
        >
          <span>Return to Dashboard</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-950/40 transition active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Invoice Document Canvas */}
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-800 print:border-slate-300">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 print:border-slate-400 print:bg-slate-100 print:text-black">
              <CheckCircle className="w-3.5 h-3.5" />
              Settled & Finalized
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white print:text-black">
              CreateKar Commercial Invoice
            </h1>
            <p className="text-sm text-slate-400 mt-1 print:text-slate-600">
              Tax invoice for verified digital creator deliverables
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="block text-xs uppercase tracking-wider text-slate-500 print:text-slate-600">
              Invoice Number
            </span>
            <span className="text-lg font-mono font-bold text-sky-400 print:text-black">
              {invoice.invoice_number}
            </span>
            <span className="block text-xs uppercase tracking-wider text-slate-500 mt-2 print:text-slate-600">
              Date of Issue
            </span>
            <span className="text-sm font-medium text-slate-300 print:text-black">
              {issueDate}
            </span>
          </div>
        </div>

        {/* Parties: Supplier (Creator) & Recipient (Agency) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-800 print:border-slate-300 text-sm">
          {/* Supplier (Creator) */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-sky-400 print:text-slate-700">
              Supplier (Creator)
            </span>
            <p className="text-base font-bold text-white print:text-black">
              {invoice.creator.name}
            </p>
            <p className="text-slate-400 print:text-slate-700">{invoice.creator.handle}</p>
            <p className="text-slate-400 print:text-slate-700">
              PAN: <span className="font-mono text-slate-200 print:text-black">{invoice.creator.pan || 'PAN Verified on file'}</span>
            </p>
            <p className="text-slate-400 print:text-slate-700">
              GSTIN: <span className="font-mono text-slate-200 print:text-black">{invoice.creator.gstin || 'Unregistered / Exempt Under Threshold'}</span>
            </p>
            <p className="text-slate-400 print:text-slate-700">
              Location: {invoice.creator.city || 'Bengaluru'}, {invoice.creator.state || 'Karnataka'}
            </p>
            {invoice.creator.upi && (
              <p className="text-xs text-slate-500 print:text-slate-600">
                Settlement UPI: {invoice.creator.upi}
              </p>
            )}
          </div>

          {/* Recipient (Agency) */}
          <div className="space-y-1.5 sm:text-right">
            <span className="block text-xs font-semibold uppercase tracking-wider text-sky-400 print:text-slate-700">
              Billed To (Agency / Brand)
            </span>
            <p className="text-base font-bold text-white print:text-black">
              {invoice.agency.name}
            </p>
            <p className="text-slate-400 print:text-slate-700">{invoice.agency.handle}</p>
            <p className="text-slate-400 print:text-slate-700">
              PAN: <span className="font-mono text-slate-200 print:text-black">{invoice.agency.pan || 'AAACK1234F'}</span>
            </p>
            <p className="text-slate-400 print:text-slate-700">
              GSTIN: <span className="font-mono text-slate-200 print:text-black">{invoice.agency.gstin || '29AAACK1234F1Z5'}</span>
            </p>
            <p className="text-slate-400 print:text-slate-700">
              Location: {invoice.agency.city || 'Bengaluru'}, {invoice.agency.state || 'Karnataka'}
            </p>
          </div>
        </div>

        {/* Deliverables Table */}
        <div className="py-8 border-b border-slate-800 print:border-slate-300">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-300 text-xs uppercase tracking-wider text-slate-400 print:text-slate-700">
                <th className="py-3 font-semibold">Service Description</th>
                <th className="py-3 font-semibold text-center">SAC Code</th>
                <th className="py-3 font-semibold text-right">Taxable Base</th>
                <th className="py-3 font-semibold text-right">CGST (9%)</th>
                <th className="py-3 font-semibold text-right">SGST (9%)</th>
                <th className="py-3 font-semibold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              <tr>
                <td className="py-4 font-medium text-white print:text-black">
                  <div>{invoice.contract.title}</div>
                  <div className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                    {deliverableName}
                  </div>
                </td>
                <td className="py-4 text-center font-mono text-slate-300 print:text-black">
                  9983
                </td>
                <td className="py-4 text-right font-medium text-slate-200 print:text-black">
                  ₹{invoice.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right text-slate-300 print:text-black">
                  ₹{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right text-slate-300 print:text-black">
                  ₹{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right font-bold text-white print:text-black">
                  ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between gap-8">
          <div className="text-xs text-slate-500 print:text-slate-600 max-w-sm space-y-2">
            <p className="font-semibold text-slate-300 print:text-black uppercase tracking-wider">
              Settlement Notes
            </p>
            <p>
              Digital content production services rendered under Indian Goods and Services Tax standard service accounting code (SAC 9983).
            </p>
            <p>
              Creator remuneration settled directly with 0% platform take rate. Flat ₹499 agency transaction processing fee applied.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400 print:text-slate-700">
              <span>Taxable Value:</span>
              <span className="font-medium text-slate-200 print:text-black">
                ₹{invoice.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-400 print:text-slate-700">
              <span>CGST (9.0%):</span>
              <span className="font-medium text-slate-200 print:text-black">
                ₹{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-400 print:text-slate-700">
              <span>SGST (9.0%):</span>
              <span className="font-medium text-slate-200 print:text-black">
                ₹{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-400 print:text-slate-700">
              <span>Platform Fee:</span>
              <span className="font-medium text-slate-200 print:text-black">
                ₹{invoice.platform_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between text-base font-bold text-white print:text-black">
              <span>Total Paid:</span>
              <span className="text-sky-400 print:text-black text-lg">
                ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
