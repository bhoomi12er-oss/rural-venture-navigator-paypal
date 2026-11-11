import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Alert = ({
  children,
  variant = 'info', // 'success' | 'warning' | 'error' | 'info'
  title,
  className = '',
  ...props
}) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-500 text-emerald-800',
    warning: 'bg-amber-50 border-amber-500 text-amber-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const Icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertTriangle,
    info: Info,
  };

  const SelectedIcon = Icons[variant];

  return (
    <div
      className={`border-l-4 p-4 rounded-r-lg flex gap-3 ${styles[variant]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        <SelectedIcon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        {title && <h4 className="font-semibold text-brand-dark mb-1">{title}</h4>}
        <div className="text-sm font-medium leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
