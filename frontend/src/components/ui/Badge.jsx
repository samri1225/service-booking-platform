import React from 'react';

const variants = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-brand-100 text-brand-800',
  cancelled: 'bg-rose-100 text-rose-800',
  declined:  'bg-slate-100 text-slate-700',
  info:      'bg-sky-100 text-sky-800',
  success:   'bg-emerald-100 text-emerald-800',
  warning:   'bg-amber-100 text-amber-800',
  danger:    'bg-rose-100 text-rose-800',
};

function Badge({ children, variant = 'info', className = '' }) {
  return (
    <span className={`badge ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;