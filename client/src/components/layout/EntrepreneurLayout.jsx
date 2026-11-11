import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../shared/LanguageToggle';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Calculator,
  QrCode,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const EntrepreneurLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/entrepreneur/dashboard', label: t('dashboard') || 'Overview Dashboard', icon: LayoutDashboard },
    { path: '/entrepreneur/products', label: 'Product Catalog & Stock', icon: Package },
    { path: '/entrepreneur/orders', label: 'Incoming Orders', icon: ShoppingBag },
    { path: '/entrepreneur/feedback', label: t('viewFeedback') || 'Customer Reviews', icon: MessageSquare },
    { path: '/entrepreneur/calculator', label: t('costCalculator') || 'Cost Calculator', icon: Calculator },
    { path: '/entrepreneur/demand-test', label: t('demandTest') || 'QR Demand Test', icon: QrCode },
    { path: '/entrepreneur/decision', label: t('decisionEngine') || 'Decision Engine', icon: BarChart3 },
    { path: '/entrepreneur/profile', label: t('profile') || 'Business Profile', icon: User },
  ];

  const activeStyle =
    'flex items-center gap-3 px-4 py-3 bg-brand-primary text-white font-bold rounded-xl transition-all shadow-sm';
  const inactiveStyle =
    'flex items-center gap-3 px-4 py-3 text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary font-semibold rounded-xl transition-all';

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-neutralGray w-full shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary transition-all"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/entrepreneur/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-black text-sm">
                RVN
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-brand-dark tracking-tight leading-none">
                  Entrepreneur Studio
                </span>
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                  उद्यम प्रबंधन पोर्टल
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            {/* Entrepreneur Badge & Logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-brand-neutralGray">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black text-brand-dark">{user?.name}</span>
                <span className="text-[10px] bg-brand-primaryLight text-brand-primary font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Millet Producer
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-light border border-brand-neutralGray text-brand-dark hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-bold text-xs rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-brand-dark/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Panel */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-brand-neutralGray flex flex-col justify-between px-5 py-6 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-61px)] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden border-b border-brand-neutralGray pb-3 mb-2">
            <span className="font-extrabold text-brand-dark text-base">Studio Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-stone-500 hover:bg-brand-neutralGray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shopkeeper Identity Card */}
          <div className="p-3.5 bg-brand-primaryLight/70 border border-brand-primary/15 rounded-xl mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0) : 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-brand-dark truncate">{user?.name || 'Entrepreneur'}</p>
              <p className="text-[11px] text-brand-primary font-bold">Mahila Jagriti SHG</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-brand-neutralGray pt-4 text-center">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              RVN Studio • Dhamtari
            </span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

