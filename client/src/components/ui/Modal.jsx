import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  ...props
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div
        className={`bg-white border border-brand-neutralGray w-full max-w-lg rounded-xl shadow-xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-brand-neutralGray bg-brand-light">
          <h3 className="text-lg sm:text-xl font-bold text-brand-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-dark opacity-60 hover:opacity-100 p-1 rounded-lg hover:bg-brand-neutralGray transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[75vh] overflow-y-auto text-brand-dark">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-brand-neutralGray bg-brand-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
