import React, { useEffect, useState } from 'react';
import { reportsApi } from '../services/reportsApi';
import { StatCard } from '../components/common/StatCard';
import { Loader } from '../components/common/Loader';
import { 
  PieChart, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  MapPin, 
  TrendingUp, 
  Download, 
  FileText,
  Compass,
  ArrowRight
} from 'lucide-react';

export const GapAnalysis = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await reportsApi.getGapAnalysisReport();
        setReport(res.data);
      } catch (e) {
        console.error('Gap analysis load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <Loader message="Computing geospatial coverage algorithms & gap matrix..." size="lg" />;

  const getGapBadge = (level) => {
    switch (level) {
      case 'HIGH_DENSITY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">High Density</span>;
      case 'MODERATE_GAP':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800">Moderate Gap</span>;
      case 'CRITICAL_GAP':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">Critical Gap</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">{level}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Geospatial Coverage Gap Analysis
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
              STRATEGIC DECISION REPORT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated spatial infrastructure assessment, uncovered surveillance blind-spots, and asset deployment recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Print State Gap Report
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="State Coverage Index"
          value={`${report?.state_coverage_index || 48.2}%`}
          subtext="Aggregate coverage efficiency"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Monitored Districts"
          value={report?.total_districts_monitored || 12}
          subtext="Districts with active nodes"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Critical Gap Districts"
          value={report?.critical_gap_districts || 14}
          subtext="Urgent camera deployment needed"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="High Coverage Zones"
          value={report?.high_coverage_districts || 4}
          subtext="Ahmedabad, Surat, Gandhinagar"
          icon={CheckCircle}
          color="cyan"
        />
      </div>

      {/* Critical Hotspots Alert Box */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Critical Border & Coastal Surveillance Deficits Identified
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Geospatial triangulation detected surveillance blind spots along high-risk transit corridors:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {report?.critical_uncovered_zones?.slice(0, 3).map((zone, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{zone.district}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                  {zone.urgency} URGENCY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{zone.type} · {zone.zone}</p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-500">Add Requirement:</span>
                <span className="font-mono font-bold text-blue-400">+{zone.recommended_addition} Cameras</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Coverage Matrix Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            District-Wise CCTV Coverage & Readiness Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">26 Gujarat Districts Analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1222] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Installed Cameras</th>
                <th className="px-4 py-3">Active / Offline</th>
                <th className="px-4 py-3">Coverage Density</th>
                <th className="px-4 py-3">Gap Assessment</th>
                <th className="px-4 py-3">Recommended Expansion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {report?.districts?.map((d, i) => (
                <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    {d.district}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {d.camera_count} Nodes
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-mono">{d.active_count} Act</span> / <span className="text-rose-400 font-mono">{d.offline_count} Off</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.coverage_score_percent}%`,
                            backgroundColor: d.coverage_score_percent > 70 ? '#10b981' : d.coverage_score_percent > 35 ? '#f59e0b' : '#f43f5e'
                          }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs">{d.coverage_score_percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getGapBadge(d.gap_level)}
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-400 font-semibold">
                    +{d.recommended_new_cameras} Units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Planning Recommendations */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Tactical Government Deployment Directives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report?.recommendations?.map((rec, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p>{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
