import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, QrCode, MessageSquare, BarChart3, User, X, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/calculator', label: t('costCalculator'), icon: Calculator },
    { path: '/demand-test', label: t('demandTest'), icon: QrCode },
    { path: '/analytics', label: t('viewFeedback'), icon: MessageSquare },
    { path: '/decision', label: t('decisionEngine'), icon: BarChart3 },
    { path: '/profile', label: t('profile'), icon: User },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3.5 bg-brand-primary text-white font-semibold rounded-lg transition-all shadow-sm";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3.5 text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary font-medium rounded-lg transition-all";

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-2 mt-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-base sm:text-lg">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-dark/45 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-brand-neutralGray flex flex-col justify-between px-6 py-6 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-65px)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside Mobile Drawer */}
        <div className="flex items-center justify-between lg:hidden border-b border-brand-neutralGray pb-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-brand-primary">{t('brandName')}</span>
            <span className="text-xs text-brand-dark opacity-60 font-medium">Navigating Success</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-brand-neutralGray text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto pt-2 lg:pt-0">
          {user && (
            <div className="flex items-center gap-3 p-4 bg-brand-primaryLight border border-brand-primaryLight rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-secondary text-brand-dark flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-brand-dark line-clamp-1">{user.name}</span>
                <span className="text-xs text-brand-primary font-semibold capitalize">
                  {user.role === 'facilitator' ? t('facilitatorLogin') : 'Millet Producer'}
                </span>
              </div>
            </div>
          )}

          {renderNavLinks()}
        </div>

        {/* Footer/Version Info */}
        <div className="border-t border-brand-neutralGray pt-4 text-center">
          <p className="text-xs font-semibold text-brand-dark opacity-65">
            RVN v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};
