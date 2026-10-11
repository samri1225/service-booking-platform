import React from 'react';

function Spinner({ size = 'md', label = 'Loading...' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 ${sizes[size]}`}></div>
      {label && <p className="mt-3 text-sm text-slate-500">{label}</p>}
    </div>
  );
}

export default Spinner;