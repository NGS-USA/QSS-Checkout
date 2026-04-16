import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { stripeProducts } from '../stripe-config';
import { ShoppingBag } from 'lucide-react';

export function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stripeProducts.map((product) => (
            <ProductCard key={product.priceId} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}