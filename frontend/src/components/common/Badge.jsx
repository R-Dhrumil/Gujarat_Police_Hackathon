import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = (status || 'Active').toLowerCase();
  
  if (s === 'active' || s === 'live' || s === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {status || 'Active'}
      </span>
    );
  }
  if (s === 'inactive' || s === 'offline' || s === 'disconnected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/80 text-rose-400 border border-rose-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        {status || 'Offline'}
      </span>
    );
  }
  if (s === 'maintenance') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        Maintenance
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {status || 'Unknown'}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const sev = (severity || 'INFO').toUpperCase();
  const styles = {
    CRITICAL: 'bg-red-950/90 text-red-300 border-red-700/80 font-bold',
    HIGH: 'bg-rose-950/80 text-rose-300 border-rose-700/80 font-semibold',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    LOW: 'bg-blue-950/80 text-blue-300 border-blue-700/80',
    INFO: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[sev] || styles.INFO}`}>
      {sev}
    </span>
  );
};

export const DepartmentBadge = ({ name, color }) => {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border"
      style={{
        backgroundColor: `${color || '#3b82f6'}15`,
        borderColor: `${color || '#3b82f6'}50`,
        color: color || '#60a5fa'
      }}
    >
      {name || 'Government'}
    </span>
  );
};
