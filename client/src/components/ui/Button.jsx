import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'light' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-emerald-800 focus:ring-brand-primary',
    secondary: 'bg-brand-secondary text-brand-dark hover:bg-opacity-90 focus:ring-brand-secondary',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primaryLight focus:ring-brand-primary',
    light: 'bg-brand-primaryLight text-brand-primary hover:bg-opacity-80 focus:ring-brand-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5 shadow-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />}
      {children}
    </button>
  );
};
