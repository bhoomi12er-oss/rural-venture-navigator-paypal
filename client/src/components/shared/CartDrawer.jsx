import React from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmountINR,
    openCheckout,
  } = useCart();

  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  // Approx USD for Sandbox preview (0.012 rate)
  const approxUSD = (totalAmountINR * 0.012).toFixed(2);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      closeCart();
      navigate('/login');
      return;
    }
    openCheckout(null); // checkout whole cart
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-brand-neutralGray">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-neutralGray flex items-center justify-between bg-brand-light">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-primaryLight text-brand-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-brand-dark leading-tight">
                  Your Cart / आपकी टोकरी
                </h2>
                <span className="text-xs text-brand-dark opacity-60 font-semibold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-brand-dark opacity-60 hover:opacity-100 hover:bg-brand-neutralGray transition-all"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-brand-light border border-brand-neutralGray flex items-center justify-center text-brand-dark opacity-40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Your cart is empty</h3>
                  <p className="text-xs text-brand-dark opacity-60 max-w-xs mt-1">
                    Explore delicious millet snacks, cookies, and flours from rural SHG women.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={closeCart}>
                  Browse Products
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const { product, quantity } = item;
                const id = product._id || product.id;
                const lineTotal = product.price * quantity;

                return (
                  <div
                    key={id}
                    className="p-4 rounded-xl border border-brand-neutralGray bg-white shadow-2xs hover:border-brand-primary/40 transition-all flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primaryLight px-2 py-0.5 rounded">
                          {product.category || 'Millet'}
                        </span>
                        <h4 className="font-extrabold text-brand-dark text-sm mt-1 leading-snug">
                          {product.productName}
                        </h4>
                        <span className="text-xs text-brand-dark opacity-60 font-semibold block mt-0.5">
                          ₹{product.price} / unit
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-brand-neutralGray/40">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-brand-neutralGray rounded-lg overflow-hidden bg-brand-light">
                        <button
                          onClick={() => updateQuantity(id, quantity - 1)}
                          className="px-2.5 py-1 text-brand-dark hover:bg-white transition-all text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-extrabold text-brand-dark bg-white border-x border-brand-neutralGray min-w-[32px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(id, quantity + 1)}
                          className="px-2.5 py-1 text-brand-dark hover:bg-white transition-all text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <span className="text-sm font-black text-brand-primary">
                          ₹{lineTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-neutralGray bg-brand-light/70 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-brand-dark opacity-75">
                  <span>Subtotal (INR):</span>
                  <span className="font-bold text-brand-dark">₹{totalAmountINR}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-brand-dark opacity-75">
                  <span>PayPal Sandbox Approx.:</span>
                  <span className="font-bold text-amber-700">${approxUSD} USD</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-brand-dark opacity-75">
                  <span>Community Delivery:</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-brand-dark border-t border-brand-neutralGray pt-2">
                  <span>Total Amount:</span>
                  <span className="text-brand-primary text-lg">₹{totalAmountINR}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={CreditCard}
                  onClick={handleCheckoutClick}
                  className="w-full font-bold shadow-md"
                >
                  Proceed to PayPal Checkout
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={clearCart}
                    className="text-xs text-stone-500 hover:text-red-600 font-semibold"
                  >
                    Clear Cart
                  </button>
                  <span className="text-[11px] text-brand-dark opacity-50 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sandbox Verified
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

