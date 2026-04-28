import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Download, Printer } from 'lucide-react';

interface SessionData {
  customerName: string;
  customerEmail: string;
  amountPaid: number;
  services: string[];
  sessionId: string;
  createdAt: number;
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/stripe-session?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSession(data);
      })
      .catch(() => setError('Could not load receipt details.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const formatDate = (unix: number) =>
    new Date(unix * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const receiptHtml = receiptRef.current?.innerHTML ?? '';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Quantum Shield Secure — Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #111; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .subtitle { color: #555; font-size: 14px; margin-bottom: 24px; }
            .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
            .value { font-size: 15px; margin-bottom: 16px; }
            .divider { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
            .service { background: #f5f5f5; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; font-size: 14px; }
            .amount { font-size: 28px; font-weight: bold; color: #0a9396; margin: 8px 0; }
            .note { font-size: 12px; color: #888; margin-top: 24px; }
            .session { font-size: 10px; color: #aaa; word-break: break-all; margin-top: 8px; }
          </style>
        </head>
        <body>${receiptHtml}</body>
      </html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QSS-Receipt-${sessionId?.slice(-8) ?? 'download'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your receipt…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">

        {/* Success header */}
        <div className="text-center mb-6">
          <div className="bg-cyan-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-400/50">
            <CheckCircle className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Payment Successful!</h1>
          <p className="text-gray-400 text-sm">Thank you for choosing Quantum Shield Secure.</p>
        </div>

        {/* Receipt card */}
        <div className="bg-gradient-to-br from-[#1a3a52] to-[#0f2542] rounded-xl border border-cyan-400/30 shadow-2xl shadow-cyan-400/10 p-6 mb-5">

          {/* Printable / downloadable area */}
          <div ref={receiptRef}>
            <h1 style={{ display: 'none' }}>Quantum Shield Secure — Payment Receipt</h1>

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white font-semibold text-lg">Payment Receipt</p>
                <p className="text-gray-400 text-xs">Quantum Shield Secure</p>
              </div>
              <span className="bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                Paid
              </span>
            </div>

            {error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : session ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Customer</p>
                    <p className="text-white text-sm font-medium">{session.customerName || '—'}</p>
                    <p className="text-gray-400 text-xs">{session.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Date</p>
                    <p className="text-white text-sm font-medium">{formatDate(session.createdAt)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Services Purchased</p>
                  <div className="space-y-2">
                    {session.services.map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-200">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Kickoff Installment Paid</p>
                      <p className="text-gray-400 text-xs">Remaining milestones invoiced separately</p>
                    </div>
                    <p className="text-cyan-400 text-2xl font-bold">{formatCurrency(session.amountPaid)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-600 text-xs break-all">Session: {session.sessionId}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Receipt details unavailable.</p>
                {sessionId && <p className="text-xs font-mono text-cyan-400 mt-2 break-all">{sessionId}</p>}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {session && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a1628] font-bold py-3 px-4 rounded-lg hover:from-cyan-300 hover:to-cyan-400 transition-all flex items-center justify-center shadow-lg shadow-cyan-400/20"
          >
            Back to Packages
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          A confirmation email will be sent to you shortly with next steps.
        </p>
      </div>
    </div>
  );
}