import React, { useState } from 'react';
import { stripeProducts, formatPrice, getPaymentSchedule } from '../stripe-config';
import { CheckCircle, Loader2, ShieldAlert, Info } from 'lucide-react';

export function CheckoutPage() {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const toggleProduct = (priceId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(priceId)) {
      newSelected.delete(priceId);
    } else {
      newSelected.add(priceId);
    }
    setSelectedProducts(newSelected);
    setMessage(null);
  };

  const calculateTotal = () => {
    return Array.from(selectedProducts).reduce((total, priceId) => {
      const product = stripeProducts.find(p => p.priceId === priceId);
      return total + (product?.price || 0);
    }, 0);
  };

  const handleCheckout = async () => {
    if (selectedProducts.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one package' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const kickoffAmount = getPaymentSchedule(total)[0].amount;

      const response = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_ids: Array.from(selectedProducts),
          kickoff_amount: Math.round(kickoffAmount * 100),
          mode: 'payment',
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to start checkout process' });
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const paymentSchedule = total > 0 ? getPaymentSchedule(total) : [];
  const kickoffInstallment = paymentSchedule[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">QUANTUM SHIELD</h1>
                <p className="text-cyan-400 text-sm font-semibold">Compliance Consulting</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-gray-400 text-sm">FIXED-FEE PACKAGES</p>
              <p className="text-cyan-400 font-semibold">No Surprise Bills</p>
            </div>
          </div>

          <div className="border-b-2 border-cyan-400 pb-8 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Select Your Compliance Services
            </h2>
            <p className="text-gray-300 text-lg">
              Firm-Fixed-Price. No Surprise Bills. Defined Deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#1a3a52] to-[#0f2542] rounded-lg p-6 mb-6 border border-cyan-400/30">
                  <h3 className="text-white font-bold text-lg mb-2">Level 1 — FCI Environments</h3>
                  <p className="text-gray-400 text-sm">Entry-level compliance packages</p>
                </div>

                <div className="space-y-4">
                  {stripeProducts.slice(3).map((product) => (
                    <div
                      key={product.priceId}
                      onClick={() => toggleProduct(product.priceId)}
                      className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedProducts.has(product.priceId)
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-400/20'
                          : 'bg-gradient-to-r from-[#1a3a52] to-[#0f2542] border-gray-600 hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-2">{product.name}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <div className="text-2xl font-bold text-cyan-400">
                            {formatPrice(product.price, product.currency)}
                          </div>
                          <div className={`w-6 h-6 rounded border-2 mt-2 flex items-center justify-center transition-all ${
                            selectedProducts.has(product.priceId)
                              ? 'bg-cyan-400 border-cyan-400'
                              : 'border-gray-600'
                          }`}>
                            {selectedProducts.has(product.priceId) && (
                              <CheckCircle className="w-5 h-5 text-[#0a1628]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-[#1a3a52] to-[#0f2542] rounded-lg p-6 my-8 border border-cyan-400/30">
                  <h3 className="text-white font-bold text-lg mb-2">Level 2 — 110 Requirements</h3>
                  <p className="text-gray-400 text-sm">Advanced compliance packages</p>
                </div>

                <div className="space-y-4">
                  {stripeProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.priceId}
                      onClick={() => toggleProduct(product.priceId)}
                      className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedProducts.has(product.priceId)
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-400/20'
                          : 'bg-gradient-to-r from-[#1a3a52] to-[#0f2542] border-gray-600 hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-2">{product.name}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <div className="text-2xl font-bold text-cyan-400">
                            {formatPrice(product.price, product.currency)}
                          </div>
                          <div className={`w-6 h-6 rounded border-2 mt-2 flex items-center justify-center transition-all ${
                            selectedProducts.has(product.priceId)
                              ? 'bg-cyan-400 border-cyan-400'
                              : 'border-gray-600'
                          }`}>
                            {selectedProducts.has(product.priceId) && (
                              <CheckCircle className="w-5 h-5 text-[#0a1628]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-gray-500 text-xs italic mt-6">
                  All packages are firm-fixed-price. Quantum Shield Secure provides readiness consulting only — we do not issue certifications or guarantee assessment outcomes.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg p-6 border-2 border-cyan-400/50 backdrop-blur">
                  <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
                    {Array.from(selectedProducts).length > 0 ? (
                      Array.from(selectedProducts).map((priceId) => {
                        const product = stripeProducts.find(p => p.priceId === priceId);
                        return (
                          <div key={priceId} className="flex justify-between text-sm">
                            <span className="text-gray-300">{product?.name}</span>
                            <span className="text-cyan-400 font-semibold">
                              {formatPrice(product?.price || 0, product?.currency || 'usd')}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-sm">No items selected</p>
                    )}
                  </div>

                  {/* Full contract value */}
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Contract Total</span>
                    <span className="text-gray-300 font-semibold text-sm line-through">
                      {formatPrice(total, 'usd')}
                    </span>
                  </div>

                  {/* Payment schedule breakdown */}
                  {kickoffInstallment && (
                    <div className="mb-6">
                      <div className="bg-[#0a1628]/60 rounded-lg p-4 border border-cyan-400/20 mb-4">
                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">Full Payment Schedule</p>
                        <div className="space-y-2">
                          {paymentSchedule.map((installment, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className={`text-xs ${i === 0 ? 'text-cyan-300 font-semibold' : 'text-gray-400'}`}>
                                {installment.label}
                              </span>
                              <span className={`text-xs font-semibold ${i === 0 ? 'text-cyan-300' : 'text-white'}`}>
                                {formatPrice(installment.amount, 'usd')}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-gray-700">
                          Firm fixed price · Hourly advisory outside scope: $250/hr
                        </p>
                      </div>

                      {/* Due today callout */}
                      <div className="bg-cyan-400/10 border border-cyan-400/40 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <p className="text-cyan-300 text-xs font-semibold uppercase tracking-wider">Due at Checkout (Kickoff)</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-300 text-sm">{kickoffInstallment.percent}% of contract</span>
                          <span className="text-3xl font-bold text-cyan-400">
                            {formatPrice(kickoffInstallment.amount, 'usd')}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          Remaining {formatPrice(total - kickoffInstallment.amount, 'usd')} invoiced per milestone.
                        </p>
                      </div>
                    </div>
                  )}

                  {!kickoffInstallment && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 text-center">
                        {Array.from(selectedProducts).length} {Array.from(selectedProducts).length === 1 ? 'package' : 'packages'} selected
                      </p>
                    </div>
                  )}

                  {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      message.type === 'error'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                        : 'bg-green-500/20 text-green-300 border border-green-500/50'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading || selectedProducts.size === 0}
                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a1628] font-bold py-3 px-4 rounded-lg hover:from-cyan-300 hover:to-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a1628] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-cyan-400/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Pay {kickoffInstallment ? formatPrice(kickoffInstallment.amount, 'usd') : ''} to Start
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}