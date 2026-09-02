import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Map, 
  PieChart, 
  Building2, 
  Video, 
  Grid3X3, 
  Car, 
  ListFilter, 
  Bell, 
  Server, 
  History, 
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const model1Links = [
    { to: '/registry', label: 'CCTV Registry', icon: Database, badge: 'M1' },
    { to: '/gis-map', label: 'GIS Map Layer', icon: Map, badge: 'M1' },
    { to: '/gap-analysis', label: 'Gap Analysis', icon: PieChart, badge: 'Report' },
    { to: '/departments', label: 'Departments', icon: Building2, badge: '26' },
  ];

  const model2Links = [
    { to: '/live-viewer', label: 'Unified Viewer', icon: Video, badge: 'Live' },
    { to: '/video-wall', label: 'Video Wall Grid', icon: Grid3X3, badge: 'Multi' },
    { to: '/anpr', label: 'ANPR & Vehicle Search', icon: Car, badge: 'AI' },
    { to: '/watchlist', label: 'Vehicle Watchlist', icon: ListFilter, badge: 'CCTNS' },
    { to: '/alerts', label: 'Live Alerts Hub', icon: Bell, badge: 'Realtime' },
    { to: '/vms-systems', label: 'VMS Gateways', icon: Server, badge: 'VMS' },
  ];

  const systemLinks = [
    { to: '/audit-logs', label: 'Audit Trail', icon: History },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  const navLinkClasses = ({ isActive }) => `
    flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group
    ${isActive 
      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40 shadow-sm shadow-blue-500/10' 
      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
    }
  `;

  return (
    <aside className="w-64 bg-[#070b16] border-r border-slate-800/80 flex flex-col h-[calc(100vh-4rem)] select-none shrink-0">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Overview */}
        <div>
          <NavLink to="/" className={navLinkClasses}>
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>State Dashboard</span>
            </div>
          </NavLink>
        </div>

        {/* Model 1 Section */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Model 1: Registry & GIS</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-950 text-sky-400 border border-sky-800">
              ASSET LAYER
            </span>
          </div>
          <div className="space-y-1">
            {model1Links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-300">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Model 2 Section */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Model 2: Viewer & Analytics</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800">
              STREAM & AI
            </span>
          </div>
          <div className="space-y-1">
            {model2Links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      link.badge === 'Live' || link.badge === 'Realtime'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800/80 text-slate-300'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* System & Audit */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            System Administration
          </div>
          <div className="space-y-1">
            {systemLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span>{link.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer State Insignia Banner */}
      <div className="p-3 border-t border-slate-800/80 bg-[#050812]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-white">State Security Grid</p>
            <p className="text-slate-500 text-[10px]">Unified Protocol v2.4</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
