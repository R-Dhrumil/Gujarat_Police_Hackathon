import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading system data...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-blue-500`} />
      {message && <p className="text-xs font-medium text-slate-400 tracking-wide">{message}</p>}
    </div>
  );
};
