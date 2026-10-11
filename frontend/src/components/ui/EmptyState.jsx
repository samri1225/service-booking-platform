import React from 'react';

function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16 px-6 animate-fade-in">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
}

export default EmptyState;