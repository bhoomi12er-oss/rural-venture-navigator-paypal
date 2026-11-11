import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * PayPal Checkout Buttons Component
 * 
 * Interacts with secure Express backend endpoints to create and capture
 * PayPal orders. Never trusts client prices and never exposes client secrets.
 */
export const PayPalCheckoutButton = ({
  items,
  onSuccess,
  onCancel,
  onError,
  disabled = false,
}) => {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch public PayPal configuration from backend
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        setLoadingConfig(true);
        const res = await fetch('http://localhost:5000/api/orders/paypal-config');
        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setConfig(data);
          } else {
            setConfigError(data.message || 'Failed to load PayPal configuration');
          }
        }
      } catch (err) {
        if (isMounted) {
          setConfigError('Could not connect to payment backend server (port 5000).');
        }
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format items payload for backend: only send productId and quantity (prices are calculated on server)
  const orderItemsPayload = items.map((item) => ({
    productId: item.productId || item.product?._id || item.product?.id,
    quantity: item.quantity || 1,
  }));

  // Create Order on Server
  const handleCreateOrder = async (data, actions) => {
    setIsProcessing(true);
    const token = localStorage.getItem('rvn_token');
    if (!token) {
      const err = new Error('Please login to complete your order.');
      onError(err);
      throw err;
    }

    try {
      const res = await fetch('http://localhost:5000/api/orders/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItemsPayload,
        }),
      });

      const orderData = await res.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Server rejected order creation');
      }

      return orderData.orderID;
    } catch (err) {
      console.error('Create PayPal Order Error:', err);
      setIsProcessing(false);
      onError(err);
      throw err;
    }
  };

  // Capture Order on Server
  const handleApprove = async (data, actions) => {
    setIsProcessing(true);
    const token = localStorage.getItem('rvn_token');

    try {
      const res = await fetch('http://localhost:5000/api/orders/capture-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderID: data.orderID,
          items: orderItemsPayload,
        }),
      });

      const captureResult = await res.json();

      if (!captureResult.success) {
        throw new Error(captureResult.message || 'Payment capture confirmation failed');
      }

      setIsProcessing(false);
      onSuccess(captureResult);
    } catch (err) {
      console.error('Capture PayPal Order Error:', err);
      setIsProcessing(false);
      onError(err);
    }
  };

  const handleCancel = (data) => {
    setIsProcessing(false);
    if (onCancel) {
      onCancel(data);
    }
  };

  const handleError = (err) => {
    setIsProcessing(false);
    console.error('PayPal Buttons Error:', err);
    if (onError) {
      onError(err);
    }
  };

  // Fallback simulator for offline evaluation / sandbox testing when keys are unconfigured
  const handleSimulateSandboxCapture = async () => {
    try {
      setIsProcessing(true);
      const orderID = await handleCreateOrder();
      await handleApprove({ orderID });
    } catch (err) {
      setIsProcessing(false);
      onError(err);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-brand-light rounded-xl border border-brand-neutralGray space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        <span className="text-xs font-semibold text-brand-dark opacity-75">
          Initializing PayPal Sandbox environment...
        </span>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-800 text-sm">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>Payment Gateway Configuration Error</span>
        </div>
        <p className="text-xs">{configError}</p>
        <p className="text-xs text-red-600 font-semibold">
          Please check that server/.env contains valid PayPal Sandbox credentials.
        </p>
      </div>
    );
  }

  const clientId = config?.clientId || 'sb';
  const currency = config?.currency || 'USD';

  // If client ID is placeholder or default 'sb', allow PayPal button rendering or fallback
  const isDefaultOrTest = !config?.isConfigured;

  return (
    <div className="w-full space-y-3">
      {/* Sandbox Test Mode Notice */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-brand-dark opacity-70 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
        <span className="flex items-center gap-1.5 text-amber-900 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          PayPal Sandbox Mode Active
        </span>
        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
          Testing Only ({currency})
        </span>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-3 bg-brand-primaryLight border border-brand-primary/20 rounded-lg text-brand-primary text-xs font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Communicating with PayPal Sandbox Server...
        </div>
      )}

      <div className={disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''}>
        <PayPalScriptProvider
          options={{
            'client-id': clientId,
            currency: currency,
            intent: 'capture',
            components: 'buttons',
          }}
        >
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 42,
            }}
            disabled={disabled || isProcessing}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onCancel={handleCancel}
            onError={handleError}
          />
        </PayPalScriptProvider>
      </div>

      {/* Simulated Sandbox option when using offline test mode or placeholder keys */}
      {isDefaultOrTest && (
        <div className="pt-2 border-t border-brand-neutralGray/60 text-center">
          <button
            type="button"
            onClick={handleSimulateSandboxCapture}
            disabled={disabled || isProcessing}
            className="text-xs font-semibold text-brand-primary hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Click here to test end-to-end flow with Mock Sandbox capture
          </button>
        </div>
      )}
    </div>
  );
};

