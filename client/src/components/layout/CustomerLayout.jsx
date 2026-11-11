import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { LanguageToggle } from '../shared/LanguageToggle';
import { CartDrawer } from '../shared/CartDrawer';
import { CheckoutModal } from '../shared/CheckoutModal';
import {
  ShoppingBag,
  ShoppingCart,
  LogOut,
  Package,
  Heart,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between selection:bg-brand-primaryLight selection:text-brand-primary">
      {/* Sticky Customer Marketplace Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-neutralGray shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <Link to="/customer/marketplace" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-brand-dark font-sans leading-none">
                    MilletMart
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Rural SHG
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-brand-dark opacity-60">
                  Direct from Rural Women Producers
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-brand-dark">
            <Link
              to="/customer/marketplace"
              className={`hover:text-brand-primary transition-colors flex items-center gap-1.5 ${
                location.pathname === '/customer/marketplace' || location.pathname === '/customer-home'
                  ? 'text-brand-primary'
                  : 'text-brand-dark opacity-80'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Explore Marketplace
            </Link>
            <a
              href="#customer-orders-section"
              className="hover:text-brand-primary transition-colors flex items-center gap-1.5 text-brand-dark opacity-80"
            >
              <Package className="w-4 h-4" />
              My Orders & Receipts
            </a>
          </nav>

          {/* Right Section: Language, Cart & Customer Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-brand-light text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary border border-brand-neutralGray transition-all flex items-center gap-2 shadow-2xs group"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold text-brand-dark">Cart</span>
              {totalItems > 0 && (
                <span className="bg-brand-primary text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Profile Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-brand-neutralGray">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-extrabold text-brand-dark line-clamp-1">{user?.name}</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  Verified Buyer
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 bg-brand-light border border-brand-neutralGray text-brand-dark hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main E-Commerce Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Customer E-Commerce Footer */}
      <footer className="bg-white border-t border-brand-neutralGray py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-brand-dark opacity-75">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>Empowering Women-led Millet Self-Help Groups in Dhamtari District, Chhattisgarh</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> PayPal Sandbox Verified
            </span>
            <span>© {new Date().getFullYear()} Rural Venture Navigator</span>
          </div>
        </div>
      </footer>

      {/* Customer-Exclusive Cart Drawer & Checkout Modal */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
};

