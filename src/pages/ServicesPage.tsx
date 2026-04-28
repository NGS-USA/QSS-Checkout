// src/pages/ServicesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { services, getSelectedPriceIds } from '../services-config';

export function ServicesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleNext = () => {
    if (selected.size === 0) return;
    const priceIds = getSelectedPriceIds(Array.from(selected));
    // Pass the selected price IDs to the checkout page via URL state
    navigate('/checkout', { state: { preselected: priceIds } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#0f2542]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-10">
          <ShieldAlert className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">QUANTUM SHIELD</h1>
            <p className="text-cyan-400 text-sm font-semibold">Compliance Consulting</p>
          </div>
        </div>

        <div className="border-b-2 border-cyan-400 pb-8 mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">What do you need help with?</h2>
          <p className="text-gray-300 text-lg">Select all the services that apply to your situation. We'll match you to the right packages.</p>
        </div>

        {/* Level 1 Services */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-[#1a3a52] to-[#0f2542] rounded-lg px-5 py-3 mb-4 border border-cyan-400/30">
            <h3 className="text-white font-bold text-base">Level 1 — FCI Environments</h3>
            <p className="text-gray-400 text-xs mt-0.5">For organizations focused on Federal Contract Information (FCI) protection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.filter(s => s.level === 1).map((service) => {
              const isSelected = selected.has(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggle(service.id)}
                  className={`p-5 rounded-lg cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-400/20'
                      : 'bg-gradient-to-r from-[#1a3a52] to-[#0f2542] border-gray-600 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base mb-1">{service.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-5 h-5 text-[#0a1628]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level 2 Services */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-[#1a3a52] to-[#0f2542] rounded-lg px-5 py-3 mb-4 border border-purple-400/30">
            <h3 className="text-white font-bold text-base">Level 2 — 110 Requirements</h3>
            <p className="text-gray-400 text-xs mt-0.5">For organizations pursuing full CMMC Level 2 certification readiness</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.filter(s => s.level === 2).map((service) => {
              const isSelected = selected.has(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggle(service.id)}
                  className={`p-5 rounded-lg cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-400 shadow-lg shadow-purple-400/20'
                      : 'bg-gradient-to-r from-[#1a3a52] to-[#0f2542] border-gray-600 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base mb-1">{service.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-400 border-purple-400' : 'border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-5 h-5 text-[#0a1628]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1a3a52] to-[#0f2542] rounded-lg px-6 py-4 border border-cyan-400/30">
          <p className="text-gray-300 text-sm">
            {selected.size === 0
              ? 'Select at least one service to continue'
              : `${selected.size} service${selected.size > 1 ? 's' : ''} selected`}
          </p>
          <button
            onClick={handleNext}
            disabled={selected.size === 0}
            className={`flex items-center gap-2 font-bold py-3 px-6 rounded-lg transition-all ${
              selected.size > 0
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a1628] hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-400/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}