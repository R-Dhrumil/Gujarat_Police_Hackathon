import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { 
  Shield, Bell, User, Clock, Radio, Activity, 
  ChevronDown, LogOut, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { unacknowledgedCount, latestToastAlert, dismissToast, triggerTestAlert, wsConnected } = useAlerts();
  const [timeStr, setTimeStr] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Toast Alert Banner if an alert arrives */}
      {latestToastAlert && (
        <div className="fixed top-16 right-6 z-50 max-w-md w-full bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900/80 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-800 text-rose-100 uppercase">
                    {latestToastAlert.severity || 'CRITICAL'} ALERT
                  </span>
                  <span className="text-xs text-rose-300 font-mono">
                    {latestToastAlert.matched_plate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{latestToastAlert.title}</h4>
                <p className="text-xs text-rose-200/90 mt-1 line-clamp-2">{latestToastAlert.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      dismissToast();
                      navigate('/alerts');
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    View Alert Details
                  </button>
                  <button
                    onClick={dismissToast}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#070b16]/95 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold tracking-widest text-sm border border-blue-400/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase">
                Gujarat State Unified CCTV Command Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                STATE GRID
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight">
              Integrated Surveillance & Metadata Analytics Platform · 26 Departments
            </p>
          </div>
        </div>

        {/* Right Section Tools */}
        <div className="flex items-center gap-4">
          {/* Live WebSocket Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[11px] font-medium font-mono">{wsConnected ? 'WS CONNECTED' : 'WS CONNECTING...'}</span>
          </div>

          {/* Test Trigger Button for Hackathon Demonstrations */}
          <button
            onClick={() => triggerTestAlert(1, 'GJ01AB1234', 'CRITICAL')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-xs font-semibold transition-colors shadow-sm"
            title="Simulate Instant Intercept Alert"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            Trigger Test Alert
          </button>

          {/* Digital Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{timeStr}</span>
          </div>

          {/* Alert Bell */}
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg">
                {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
              </span>
            )}
          </button>

          {/* User Profile & Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-blue-400 uppercase tracking-wider">{user?.role || 'SUPER_ADMIN'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0c1424] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-400">{user?.department_name || 'All Departments'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                    Role: {user?.role}
                  </span>
                </div>

                {/* Quick Role Switcher for Hackathon Evaluation */}
                <div className="p-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Demo Role Switcher (RBAC)
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => { switchDemoRole('SUPER_ADMIN'); setShowProfileMenu(false); }}
                      className="w-full text-left px-2 py-1 rounded text-xs text-slate-300 hover:bg-blue-950 hover:text-blue-300 flex items-center justify-between"
                    >
                      <span>Super Admin</span>
                      {user?.role === 'SUPER_ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                    <button
                      onClick={() => { switchDemoRole('POLICE_ADMIN'); setShowProfileMenu(false); }}
                      className="w-full text-left px-2 py-1 rounded text-xs text-slate-300 hover:bg-blue-950 hover:text-blue-300 flex items-center justify-between"
                    >
                      <span>Police DSP Admin</span>
                      {user?.role === 'DEPARTMENT_ADMIN' && user?.department_name?.includes('Police') && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                    <button
                      onClick={() => { switchDemoRole('RTO_ADMIN'); setShowProfileMenu(false); }}
                      className="w-full text-left px-2 py-1 rounded text-xs text-slate-300 hover:bg-blue-950 hover:text-blue-300 flex items-center justify-between"
                    >
                      <span>RTO Admin</span>
                      {user?.role === 'DEPARTMENT_ADMIN' && user?.department_name?.includes('RTO') && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); navigate('/login'); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/60 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
