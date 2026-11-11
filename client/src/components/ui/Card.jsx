import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  title,
  subtitle,
  headerActions,
  ...props
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-brand-neutralGray rounded-xl p-6 shadow-sm ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:border-brand-primary transition-all duration-200 active:scale-[0.99]' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-brand-neutralGray pb-4">
          <div>
            {title && <h3 className="text-xl font-semibold text-brand-dark tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-brand-dark opacity-75 mt-0.5">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2 mt-2 sm:mt-0">{headerActions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
