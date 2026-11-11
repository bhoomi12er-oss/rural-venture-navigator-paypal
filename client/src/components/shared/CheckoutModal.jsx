import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CheckoutModal = () => {
  const { isCheckoutOpen, closeCheckout, checkoutItem, items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Modal view states: 'checkout' | 'success' | 'cancelled' | 'error'
  const [modalState, setModalState] = useState('checkout');
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Single item quantity controller for direct "Buy Now" flow
  const [singleQty, setSingleQty] = useState(1);

  if (!isCheckoutOpen) return null;

  // Determine items being purchased
  const checkoutItems = checkoutItem
    ? [{ product: checkoutItem, quantity: singleQty }]
    : items;

  const totalAmountINR = checkoutItems.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  );

  const approxUSD = (totalAmountINR * 0.012).toFixed(2);

  const handleClose = () => {
    // Reset view state upon closing
    setModalState('checkout');
    setSuccessData(null);
    setErrorMessage('');
    closeCheckout();
  };

  const handlePaymentSuccess = (result) => {
    setSuccessData(result);
    setModalState('success');
    // Clear whole cart if full cart checkout was performed
    if (!checkoutItem) {
      clearCart();
    }
  };

  const handlePaymentCancel = (data) => {
    setModalState('cancelled');
  };

  const handlePaymentError = (err) => {
    setErrorMessage(err?.message || 'An unexpected error occurred during PayPal transaction.');
    setModalState('error');
  };

  // 1. SUCCESS STATE
  if (modalState === 'success') {
    const firstOrderedItem = successData?.orders?.[0];
    const captureId = successData?.captureId || successData?.orderID;
    const payerEmail = successData?.payerEmail || 'PayPal Sandbox Account';

    return (
      <Modal
        isOpen={isCheckoutOpen}
        onClose={handleClose}
        title="Payment Verified & Order Confirmed!"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
            {firstOrderedItem?.productId && (
              <Link
                to={`/feedback/${firstOrderedItem.productId._id || firstOrderedItem.productId}`}
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                <Button variant="primary" size="sm" icon={MessageSquare} className="w-full font-bold">
                  Give Feedback / समीक्षा दें
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleClose} className="w-full sm:w-auto font-bold">
              Continue Shopping
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-500 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              PayPal Capture Confirmed
            </span>
            <h3 className="text-2xl font-black text-brand-dark pt-1">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-brand-dark opacity-75 max-w-sm font-semibold">
              Your payment has been securely captured via PayPal Sandbox and forwarded to our rural self-help group partners.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="w-full bg-brand-light border border-brand-neutralGray rounded-xl p-4 text-left space-y-2.5 text-xs font-medium">
            <div className="flex justify-between border-b border-brand-neutralGray/60 pb-2">
              <span className="text-brand-dark opacity-60">PayPal Transaction ID:</span>
              <span className="font-mono font-bold text-brand-dark">{captureId}</span>
            </div>
            <div className="flex justify-between border-b border-brand-neutralGray/60 pb-2">
              <span className="text-brand-dark opacity-60">PayPal Order ID:</span>
              <span className="font-mono text-brand-dark">{successData?.orderID}</span>
            </div>
            <div className="flex justify-between border-b border-brand-neutralGray/60 pb-2">
              <span className="text-brand-dark opacity-60">Payer Account:</span>
              <span className="font-semibold text-brand-dark">{payerEmail}</span>
            </div>
            <div className="flex justify-between border-b border-brand-neutralGray/60 pb-2">
              <span className="text-brand-dark opacity-60">Items Ordered:</span>
              <span className="font-bold text-brand-dark">{checkoutItems.length} products</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-extrabold text-brand-primary">
              <span>Total Paid:</span>
              <span>₹{totalAmountINR} (~${approxUSD} USD)</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic">
            Please share direct feedback to help rural women refine their product taste and price suitability.
          </p>
        </div>
      </Modal>
    );
  }

  // 2. CANCELLED STATE
  if (modalState === 'cancelled') {
    return (
      <Modal
        isOpen={isCheckoutOpen}
        onClose={handleClose}
        title="Payment Cancelled"
        footer={
          <div className="flex gap-2 w-full justify-between items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalState('checkout')}
              className="font-bold"
            >
              Try Again / दोबारा प्रयास करें
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose} className="font-bold">
              Cancel & Return
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border-2 border-amber-400">
            <AlertTriangle className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-brand-dark">
              Checkout Cancelled in PayPal
            </h3>
            <p className="text-xs text-brand-dark opacity-75 max-w-sm font-semibold leading-relaxed">
              No money was deducted from your account. Your cart items are still saved so you can complete your purchase whenever you are ready.
            </p>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium text-left w-full">
            💡 If you closed the PayPal popup accidentally, click <strong>"Try Again"</strong> below to relaunch the PayPal window.
          </div>
        </div>
      </Modal>
    );
  }

  // 3. ERROR STATE
  if (modalState === 'error') {
    return (
      <Modal
        isOpen={isCheckoutOpen}
        onClose={handleClose}
        title="Payment Error"
        footer={
          <div className="flex gap-2 w-full justify-between items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalState('checkout')}
              className="font-bold"
            >
              Retry Payment
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose} className="font-bold">
              Close
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-400">
            <XCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-red-700">
              Payment Could Not Be Completed
            </h3>
            <p className="text-xs text-brand-dark opacity-75 max-w-sm font-semibold leading-relaxed">
              We encountered an issue while communicating with PayPal Sandbox.
            </p>
          </div>

          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">
              Diagnostic Detail:
            </span>
            <p className="text-xs font-mono text-red-800 break-words">
              {errorMessage || 'Unknown payment error'}
            </p>
          </div>

          <div className="text-[11px] text-stone-500 text-left w-full space-y-1">
            <p className="font-bold text-brand-dark">Troubleshooting Tips for Evaluators:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Ensure server is running with <code className="text-xs bg-stone-100 px-1">PORT=5000</code>.</li>
              <li>Verify <code className="text-xs bg-stone-100 px-1">server/.env</code> has valid PayPal Sandbox keys.</li>
              <li>Make sure you are logged into a PayPal Sandbox Buyer account (not personal live credentials).</li>
            </ul>
          </div>
        </div>
      </Modal>
    );
  }

  // 4. CHECKOUT REVIEW & PAYPAL BUTTONS (DEFAULT STATE)
  return (
    <Modal
      isOpen={isCheckoutOpen}
      onClose={handleClose}
      title="Secure PayPal Sandbox Checkout"
      className="max-w-xl"
    >
      <div className="space-y-5">
        
        {/* Auth Guard Banner if user not logged in */}
        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-xs font-bold text-amber-900">
                Please login to complete your PayPal order.
              </div>
            </div>
            <Link to="/login" onClick={handleClose}>
              <Button variant="primary" size="sm" className="font-bold text-xs">
                Login Now
              </Button>
            </Link>
          </div>
        )}

        {/* Order Items Review */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-brand-neutralGray pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark opacity-60">
              Order Items ({checkoutItems.length})
            </span>
            <span className="text-xs font-semibold text-brand-primary">
              Rural SHG Marketplace
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {checkoutItems.map((item, idx) => {
              const { product, quantity } = item;
              return (
                <div
                  key={product._id || product.id || idx}
                  className="flex items-center justify-between p-2.5 bg-brand-light rounded-lg border border-brand-neutralGray/60 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-extrabold text-brand-dark line-clamp-1">{product.productName}</p>
                    <p className="text-[11px] text-stone-500">
                      ₹{product.price} × {quantity}
                    </p>
                  </div>
                  <div className="text-right font-black text-brand-dark">
                    ₹{product.price * quantity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white border border-brand-neutralGray rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex justify-between text-xs font-semibold text-brand-dark opacity-75">
            <span>Subtotal:</span>
            <span className="font-bold text-brand-dark">₹{totalAmountINR}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-brand-dark opacity-75">
            <span>Shipping / SHG Delivery:</span>
            <span className="font-bold text-emerald-700">FREE</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-amber-800 bg-amber-50/70 p-1.5 rounded">
            <span>PayPal Sandbox Equivalent:</span>
            <span className="font-bold">${approxUSD} USD</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-brand-dark border-t border-brand-neutralGray pt-2">
            <span>Total Payable:</span>
            <span className="text-brand-primary font-black text-lg">₹{totalAmountINR}</span>
          </div>
        </div>

        {/* Customer Delivery Details */}
        {isAuthenticated && user && (
          <div className="p-3 bg-brand-light border border-brand-neutralGray rounded-lg text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-dark opacity-60">Ordering As:</span>
            <div className="font-bold text-brand-dark">{user.name} ({user.phone || 'Phone: +91'})</div>
            <div className="text-[11px] text-brand-dark opacity-70">
              Address: Local Dhamtari Community Delivery (Direct from Rural Producer)
            </div>
          </div>
        )}

        {/* PayPal SDK Buttons Section */}
        <div className="pt-2">
          {isAuthenticated ? (
            <PayPalCheckoutButton
              items={checkoutItems}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              onError={handlePaymentError}
              disabled={checkoutItems.length === 0}
            />
          ) : (
            <div className="text-center py-4">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                onClick={() => {
                  handleClose();
                  navigate('/login');
                }}
              >
                Log In to Pay with PayPal
              </Button>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

