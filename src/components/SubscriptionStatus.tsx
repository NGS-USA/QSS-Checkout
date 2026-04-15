import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';
import { Crown, AlertCircle, CheckCircle } from 'lucide-react';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        setError('Failed to fetch subscription data');
        return;
      }

      setSubscription(data);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-gray-700">No active subscription</span>
        </div>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = subscription.subscription_status === 'active';
  const periodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <div className={`rounded-lg shadow p-4 border ${
      isActive ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-center mb-2">
        {isActive ? (
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        ) : (
          <Crown className="w-5 h-5 text-yellow-500 mr-2" />
        )}
        <h3 className={`font-semibold ${
          isActive ? 'text-green-800' : 'text-yellow-800'
        }`}>
          {product?.name || 'Subscription'}
        </h3>
      </div>
      
      <div className={`text-sm ${
        isActive ? 'text-green-700' : 'text-yellow-700'
      }`}>
        <p className="capitalize mb-1">Status: {subscription.subscription_status.replace('_', ' ')}</p>
        {periodEnd && (
          <p>
            {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on {periodEnd}
          </p>
        )}
      </div>
    </div>
  );
}