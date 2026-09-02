import React, { useEffect, useState } from 'react';
import { anprApi } from '../services/anprApi';
import { cameraApi } from '../services/cameraApi';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { 
  Car, 
  Search, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Radio, 
  Activity,
  History,
  Route,
  Camera as CameraIcon,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ANPRPage = () => {
  const [results, setResults] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plateQuery, setPlateQuery] = useState('');
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [trackedPlateTrajectory, setTrackedPlateTrajectory] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const navigate = useNavigate();

  const loadANPR = async () => {
    setLoading(true);
    try {
      const [anprRes, camRes] = await Promise.all([
        anprApi.getResults({
          plate_number: plateQuery || undefined,
          camera_id: selectedCameraId || undefined,
          limit: 100
        }),
        cameraApi.getCameras({ limit: 100 })
      ]);
      setResults(anprRes.data);
      setCameras(camRes.data);
    } catch (e) {
      console.error('ANPR load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadANPR();
  }, [selectedCameraId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadANPR();
  };

  const handleTrackTrajectory = async (plateNumber) => {
    setTrackLoading(true);
    try {
      const res = await anprApi.trackVehicle(plateNumber);
      setTrackedPlateTrajectory(res.data);
    } catch (e) {
      alert(`No comprehensive movement trajectory found for ${plateNumber}`);
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Automated Number Plate Recognition (ANPR) & Vehicle Movement Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              MODEL 2 AI INFERENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical vehicle plate recognition, eGujCop CCTNS / VAHAN cross-matching, and multi-camera spatial tracking
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by License Plate Number (e.g. GJ01AB1234, GJ05...)"
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
          >
            Search Sighting
          </button>
        </form>

        <div className="w-full md:w-auto">
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Strategic Camera Checkpoints</option>
            {cameras.map(c => (
              <option key={c.id} value={c.id}>{c.camera_code} - {c.name} ({c.district})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trajectory Timeline Box (if vehicle selected) */}
      {trackedPlateTrajectory && (
        <div className="glass-panel p-6 rounded-2xl border border-blue-600/60 bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-900 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Route className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Spatial Trajectory Track: <span className="font-mono text-blue-400">{trackedPlateTrajectory.plate_number}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {trackedPlateTrajectory.total_sightings} Sightings Detected across Gujarat CCTV Grid
                </p>
              </div>
            </div>
            <button
              onClick={() => setTrackedPlateTrajectory(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Trajectory
            </button>
          </div>

          {/* Timeline Nodes */}
          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto pb-2">
            {trackedPlateTrajectory.timeline.map((node, index) => (
              <React.Fragment key={index}>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs min-w-[200px] space-y-1 relative group hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{node.camera_code}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{(node.confidence * 100).toFixed(0)}% OCR</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">{node.camera_name}</p>
                  <p className="text-[10px] text-slate-500">{node.district}</p>
                  <div className="flex items-center justify-between text-[10px] text-blue-400 pt-1 border-t border-slate-800 font-mono">
                    <span>{new Date(node.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span>{node.speed_kmph ? `${node.speed_kmph} km/h` : ''}</span>
                  </div>
                </div>
                {index < trackedPlateTrajectory.timeline.length - 1 && (
                  <div className="hidden md:block w-8 h-0.5 bg-blue-600/60 shrink-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ANPR Results Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-400" />
            Live ANPR Vehicle Detection Index
          </h3>
          <span className="text-xs text-slate-400 font-mono">{results.length} Scans Loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1222] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">License Plate</th>
                <th className="px-4 py-3.5">Camera Checkpoint</th>
                <th className="px-4 py-3.5">District / Region</th>
                <th className="px-4 py-3.5">Vehicle Classification</th>
                <th className="px-4 py-3.5">OCR Confidence</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Watchlist Hot-Match</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <Loader message="Querying indexed ANPR detection logs..." />
                  </td>
                </tr>
              ) : results.length > 0 ? (
                results.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-white tracking-widest text-xs">
                        {rec.plate_number}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-200 block">{rec.camera_code}</span>
                      <span className="text-[11px] text-slate-400 truncate block max-w-[180px]">{rec.camera_name}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {rec.district || 'Ahmedabad'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-200 block">{rec.vehicle_type}</span>
                      <span className="text-[10px] text-slate-500">{rec.vehicle_color}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className={rec.confidence > 0.9 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {(rec.confidence * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(rec.detected_at).toLocaleString('en-IN', { hour12: true })}
                    </td>

                    <td className="px-4 py-3.5">
                      {rec.is_watchlist_match ? (
                        <div className="space-y-1">
                          <SeverityBadge severity={rec.watchlist_priority || 'HIGH'} />
                          <span className="text-[10px] text-rose-400 block truncate max-w-[140px]">
                            {rec.watchlist_reason}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Normal Traffic</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleTrackTrajectory(rec.plate_number)}
                        className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 hover:bg-blue-900 text-xs font-medium transition-colors"
                        title="Plot movement trajectory across cameras"
                      >
                        Track Trajectory
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 text-xs">
                    No license plate sightings match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
