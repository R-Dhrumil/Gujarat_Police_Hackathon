import React, { useState } from 'react';
import { gridApi } from '../services/gridApi';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';
import { 
  Settings, 
  Server, 
  Radio, 
  RefreshCw, 
  CheckCircle, 
  ShieldCheck, 
  Database,
  Cpu
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [gridHost, setGridHost] = useState('http://localhost:8080');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSyncGrid = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await gridApi.syncCameras(gridHost);
      setSyncResult(res.data);
    } catch (e) {
      alert('Failed to synchronize with hackathon grid');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-wide">
          System Configuration & Stream Gateway Ingest
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure external camera grid hosts, RTSP transport parameters, and RBAC policies
        </p>
      </div>

      {/* Grid Synchronizer Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hackathon Live Camera Grid Synchronizer</h3>
            <p className="text-xs text-slate-400">Connect to the live hackathon ingest catalogue (GET /api/ingest)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <label className="text-xs text-slate-300 font-medium block">Camera Grid Base Host URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={gridHost}
              onChange={(e) => setGridHost(e.target.value)}
              placeholder="e.g. http://192.168.1.100 or http://localhost:8080"
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none"
            />
            <button
              onClick={handleSyncGrid}
              disabled={syncing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {syncing ? <Loader message="" size="sm" /> : <RefreshCw className="w-4 h-4" />}
              Synchronize Streams
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-800 text-xs text-slate-200 space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {syncResult.message}
            </div>
            {syncResult.synced_stats && (
              <p className="text-slate-400 text-[11px]">
                Created: {syncResult.synced_stats.created} · Updated: {syncResult.synced_stats.updated} · Total Feeds: {syncResult.synced_stats.total_synced}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Protocol & Security Directives Checklist */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Hackathon Technical Compliance Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">RTSP over TCP Transport Enforced</span>
              <span className="text-slate-400 text-[11px]">OPENCV_FFMPEG_CAPTURE_OPTIONS set to 'rtsp_transport;tcp'</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">PTS-Driven Monotonic Timing</span>
              <span className="text-slate-400 text-[11px]">Inference uses CAP_PROP_POS_MSEC, no arrival time assumptions</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Exponential Backoff Reconnection</span>
              <span className="text-slate-400 text-[11px]">Auto-reconnect with 2s initial delay capping at 30s</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Mixed H.264 & H.265 Decoding</span>
              <span className="text-slate-400 text-[11px]">Mid-stream decoder join warnings treated as non-fatal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
