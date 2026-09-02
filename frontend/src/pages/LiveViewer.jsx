import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cameraApi } from '../services/cameraApi';
import { streamApi } from '../services/streamApi';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { StatusBadge, DepartmentBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { 
  Video, 
  Search, 
  Activity, 
  Shield, 
  MapPin, 
  Cpu, 
  Sliders, 
  Maximize2, 
  Radio, 
  Camera,
  Play,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export const LiveViewer = () => {
  const [searchParams] = useSearchParams();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [analyticsToggling, setAnalyticsToggling] = useState(false);

  const initialCamId = searchParams.get('camera');

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await cameraApi.getCameras({ limit: 100 });
        setCameras(res.data);
        if (res.data.length > 0) {
          if (initialCamId) {
            const found = res.data.find(c => String(c.id) === initialCamId);
            setSelectedCamera(found || res.data[0]);
          } else {
            setSelectedCamera(res.data[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load cameras:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
  }, [initialCamId]);

  const toggleAnalytics = async () => {
    if (!selectedCamera) return;
    setAnalyticsToggling(true);
    try {
      if (selectedCamera.analytics_enabled) {
        await streamApi.stopAnalytics(selectedCamera.id);
        setSelectedCamera({ ...selectedCamera, analytics_enabled: false, anpr_enabled: false });
      } else {
        await streamApi.startAnalytics(selectedCamera.id);
        setSelectedCamera({ ...selectedCamera, analytics_enabled: true, anpr_enabled: true });
      }
    } catch (e) {
      alert('Failed to toggle ANPR analytics service');
    } finally {
      setAnalyticsToggling(false);
    }
  };

  if (loading) return <Loader message="Connecting to State Stream Gateway & Multi-VMS Feeds..." size="lg" />;

  const filteredCameras = cameras.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.camera_code.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Unified Live CCTV Viewer
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              MODEL 2 MULTI-VMS GATEWAY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access live streams across Police, AMC, RTO, and Food Civil Supplies networks without disturbing independent VMS platforms
          </p>
        </div>

        {selectedCamera && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAnalytics}
              disabled={analyticsToggling}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                selectedCamera.analytics_enabled
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              {selectedCamera.analytics_enabled ? 'ANPR Inference: ACTIVE' : 'Enable Real-time ANPR'}
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Camera Selector Sidebar + Large Stream Viewer + Metadata Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Camera Selector List (1 col) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col h-[680px]">
          <div className="pb-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                Select Camera Feed
              </h3>
              <span className="text-[11px] font-mono text-slate-400">{filteredCameras.length}</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by code or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            {filteredCameras.map((cam) => {
              const isSelected = selectedCamera?.id === cam.id;
              return (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/80 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{cam.camera_code}</span>
                    <span className={`w-2 h-2 rounded-full ${cam.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{cam.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
                    <span>{cam.district}</span>
                    <span>{cam.camera_type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Large Video Stream View (2 cols) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          {selectedCamera ? (
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
              <VideoPlayer
                hlsUrl={selectedCamera.hls_url}
                cameraName={selectedCamera.name}
                cameraCode={selectedCamera.camera_code}
                departmentName={selectedCamera.department_name || 'Gujarat Police'}
                isLive={selectedCamera.status === 'Active'}
                aspectRatio="aspect-video"
                showControls={true}
              />

              {/* Tactical Status & Diagnostics */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Protocol Transport</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">RTSP over TCP (Mandated)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Codec & Frame Rate</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">{selectedCamera.codec || 'H.264'} @ 25 FPS</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">PTS Delta Timing</span>
                  <span className="font-mono font-bold text-emerald-400 mt-0.5 block">Monotonic Real-time</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
              Select a camera from the list to begin live stream playback.
            </div>
          )}
        </div>

        {/* Right: Camera Metadata & PTZ Control Panel (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Stream Metadata
              </h3>
            </div>

            {selectedCamera ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department Network:</span>
                  <span className="font-semibold text-slate-200">{selectedCamera.department_name || 'Home Dept'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">VMS Gateway Source:</span>
                  <span className="font-mono text-slate-200">{selectedCamera.vms_name || 'State Media Gateway #1'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Geographical Location:</span>
                  <span className="text-slate-200">{selectedCamera.landmark_address || `${selectedCamera.city}, ${selectedCamera.district}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">GPS Coordinates:</span>
                  <span className="font-mono text-slate-300">{selectedCamera.latitude?.toFixed(4)}, {selectedCamera.longitude?.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Storage Policy:</span>
                  <span className="text-slate-300">{selectedCamera.storage_type} ({selectedCamera.retention_days} Days)</span>
                </div>
              </div>
            ) : null}

            {/* Simulated PTZ Controller */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                PTZ Pan/Tilt/Zoom Control
              </span>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <button className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]">
                    HOME
                  </button>
                  <button className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1 border border-slate-700">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Zoom In
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1 border border-slate-700">
                  <ZoomOut className="w-3.5 h-3.5 text-blue-400" /> Zoom Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
