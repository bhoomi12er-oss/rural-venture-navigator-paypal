import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { LanguageToggle } from './LanguageToggle';

export const Navbar = ({ onMenuClick }) => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const homePath = isAuthenticated ? (user?.role === 'customer' ? '/customer-home' : '/dashboard') : '/';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-neutralGray w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left Section: Brand & Hamburger */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link to={homePath} className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary font-sans">
              {t('brandName')}
            </span>
          </Link>
        </div>

        {/* Right Section: Controls, Cart & Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Shopping Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-xl text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary border border-brand-neutralGray/70 transition-all flex items-center gap-1.5"
            aria-label="Shopping Cart"
            title="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="bg-brand-primary text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {totalItems}
              </span>
            )}
          </button>

          <LanguageToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-sm font-semibold text-brand-dark border-r border-brand-neutralGray pr-4">
                {t('welcomeBack')} <span className="text-brand-primary font-bold">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-light border border-brand-neutralGray text-brand-dark hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-semibold text-sm rounded-lg transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-semibold text-brand-primary hover:text-emerald-800 transition-all"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
