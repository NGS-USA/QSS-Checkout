import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-[#1a3a52] to-[#0f2542] rounded-lg shadow-2xl shadow-cyan-400/20 p-8 text-center border border-cyan-400/30">
        <div className="mb-6">
          <div className="bg-cyan-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-400/50">
            <CheckCircle className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-300">
            Thank you for choosing Quantum Shield Secure. Your payment has been processed successfully.
          </p>
        </div>

        {sessionId && (
          <div className="bg-cyan-400/5 rounded-lg p-4 mb-6 border border-cyan-400/20">
            <p className="text-xs text-gray-400 mb-2">Session ID:</p>
            <p className="text-xs font-mono text-cyan-400 break-all">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <Link
            to="/checkout"
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a1628] font-bold py-3 px-4 rounded-lg hover:from-cyan-300 hover:to-cyan-400 transition-all flex items-center justify-center shadow-lg shadow-cyan-400/30"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Browse More Services
          </Link>

          <Link
            to="/checkout"
            className="w-full bg-gray-600/20 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-600/30 transition-colors flex items-center justify-center border border-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-600">
          <p className="text-xs text-gray-400">
            You will receive a confirmation email shortly with your purchase details and next steps.
          </p>
        </div>
      </div>
    </div>
  );
}