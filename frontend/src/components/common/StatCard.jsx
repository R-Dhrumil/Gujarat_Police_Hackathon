import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'blue', trend = null, pulse = false }) => {
  const colorMap = {
    blue: {
      border: 'border-blue-800/40 hover:border-blue-600/60',
      bgIcon: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
      text: 'text-blue-400'
    },
    emerald: {
      border: 'border-emerald-800/40 hover:border-emerald-600/60',
      bgIcon: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
      text: 'text-emerald-400'
    },
    rose: {
      border: 'border-rose-800/40 hover:border-rose-600/60',
      bgIcon: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
      text: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-800/40 hover:border-amber-600/60',
      bgIcon: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
      text: 'text-amber-400'
    },
    cyan: {
      border: 'border-cyan-800/40 hover:border-cyan-600/60',
      bgIcon: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60',
      text: 'text-cyan-400'
    },
    purple: {
      border: 'border-purple-800/40 hover:border-purple-600/60',
      bgIcon: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
      text: 'text-purple-400'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass-panel p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${scheme.border}`}>
      {/* Subtle background glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 ${scheme.text} pointer-events-none group-hover:opacity-25 transition-opacity`}></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
            {pulse && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {trend && (
                <span className={trend > 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              <span>{subtext}</span>
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${scheme.bgIcon} transition-transform group-hover:scale-110 duration-200 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
