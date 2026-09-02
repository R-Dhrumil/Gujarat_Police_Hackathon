import React, { useEffect, useState } from 'react';
import { reportsApi } from '../services/reportsApi';
import { cameraApi } from '../services/cameraApi';
import { alertApi } from '../services/alertApi';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';
import { GISMapComponent } from '../components/map/GISMapComponent';
import { Loader } from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Video, 
  AlertTriangle, 
  Building2, 
  Car, 
  CheckCircle, 
  MapPin, 
  Activity, 
  ExternalLink,
  Layers,
  Search,
  Radio
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, camsRes, alertsRes] = await Promise.allSettled([
          reportsApi.getDashboardStats(),
          cameraApi.getCameras({ limit: 25 }),
          alertApi.getAlerts({ limit: 5 })
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (camsRes.status === 'fulfilled') setCameras(camsRes.value.data);
        if (alertsRes.status === 'fulfilled') setRecentAlerts(alertsRes.value.data);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader message="Loading State Command Center Metrics..." size="lg" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Gujarat State CCTV Operations Overview
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              OPERATIONAL
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-departmental asset visibility, stream gateway connectivity, and automated threat interception
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/video-wall')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Video className="w-4 h-4" />
            Open Video Wall (4x4)
          </button>
          <button
            onClick={() => navigate('/gis-map')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            GIS Geo-Registry
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total CCTV Inventory"
          value={stats?.total_cameras || 12450}
          subtext="Registered across 26 departments"
          icon={Camera}
          color="blue"
        />
        <StatCard
          title="Active Live Streams"
          value={stats?.active_cameras || 10892}
          subtext="Connected to central gateway"
          icon={Activity}
          color="emerald"
          pulse={true}
        />
        <StatCard
          title="ANPR Detections (24h)"
          value={stats?.total_anpr_detections_24h || 1247}
          subtext="Vehicle plate scans indexed"
          icon={Car}
          color="cyan"
        />
        <StatCard
          title="Active Watchlist Alerts"
          value={stats?.unacknowledged_alerts || 4}
          subtext="Unacknowledged threat intercepts"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Main Grid: GIS Preview + Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini GIS Map Heatmap (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                Gujarat State GIS Coverage Map
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displaying 22 strategic camera nodes across 12 key districts
              </p>
            </div>
            <button
              onClick={() => navigate('/gis-map')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Full Interactive Map <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <GISMapComponent
            cameras={cameras}
            height="h-[380px]"
            showCoverageRadius={true}
            zoom={7}
          />
        </div>

        {/* Live Intercepts & Alerts Feed (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                Recent Intercept Alerts
              </h3>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {recentAlerts.length > 0 ? (
                recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => navigate('/alerts')}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-600/60 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-rose-400">
                        {alert.matched_plate || 'TACTICAL ALERT'}
                      </span>
                      <SeverityBadge severity={alert.severity} />
                    </div>
                    <p className="text-xs text-slate-300 font-medium line-clamp-1">{alert.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{alert.camera_code || 'Camera'} ({alert.district || 'Gujarat'})</span>
                      <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No active security alerts
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4">
            <button
              onClick={() => navigate('/anpr')}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              Search Vehicle Intelligence Records
            </button>
          </div>
        </div>
      </div>

      {/* Department & Asset Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Monitored Departments */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            Top Departmental CCTV Deployments
          </h3>
          <div className="space-y-3">
            {stats?.department_distribution?.slice(0, 5).map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">{dept.department}</span>
                  <span className="font-mono text-slate-400">{dept.camera_count} cameras</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dept.camera_count / Math.max(1, stats.total_cameras || 100)) * 100 * 3)}%`,
                      backgroundColor: dept.color || '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Camera Hardware Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Camera Technology & Asset Types
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats?.camera_type_distribution?.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">{t.type}</span>
                  <span className="font-bold text-white text-base mt-0.5 block">{t.count} Nodes</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
