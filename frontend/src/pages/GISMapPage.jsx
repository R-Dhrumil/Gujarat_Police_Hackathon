import React, { useEffect, useState } from 'react';
import { cameraApi } from '../services/cameraApi';
import { departmentApi } from '../services/departmentApi';
import { GISMapComponent } from '../components/map/GISMapComponent';
import { Loader } from '../components/common/Loader';
import { StatusBadge, DepartmentBadge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Filter, 
  MapPin, 
  Video, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Building2,
  Shield,
  Activity,
  Compass
} from 'lucide-react';

export const GISMapPage = () => {
  const [cameras, setCameras] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // Layer Toggles
  const [showCoverageRadius, setShowCoverageRadius] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const navigate = useNavigate();

  const loadCameras = async () => {
    setLoading(true);
    try {
      const [camRes, deptRes] = await Promise.all([
        cameraApi.getCameras({
          department_id: selectedDeptId || undefined,
          camera_type: selectedType || undefined,
          status: selectedStatus || undefined,
          district: selectedDistrict || undefined,
          limit: 1000
        }),
        departmentApi.getDepartments()
      ]);
      setCameras(camRes.data);
      setDepartments(deptRes.data);
      if (camRes.data.length > 0 && !selectedCamera) {
        setSelectedCamera(camRes.data[0]);
      }
    } catch (e) {
      console.error('GIS load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, [selectedDeptId, selectedType, selectedStatus, selectedDistrict]);

  const uniqueDistricts = Array.from(new Set(cameras.map(c => c.district))).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Gujarat State GIS Geospatial Mapping
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
              MODEL 1 GIS LAYER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive multi-layered spatial visualization of CCTV infrastructure, coverage radii, and monitoring gaps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCoverageRadius(!showCoverageRadius)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              showCoverageRadius
                ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showCoverageRadius ? <Eye className="w-4 h-4 text-blue-400" /> : <EyeOff className="w-4 h-4" />}
            {showCoverageRadius ? 'Coverage Radius: ON' : 'Coverage Radius: OFF'}
          </button>
          <button
            onClick={loadCameras}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Map Markers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Filters + Map + Camera Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter & Layer Sidebar (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              GIS Layer Filters
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{cameras.length} nodes</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Department Layer */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Department Layer</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">District / Zone</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="">All Gujarat Districts</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Camera Type */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Camera Optics Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="">All Optics Types</option>
                <option value="IP">IP Static</option>
                <option value="PTZ">PTZ Motorized</option>
                <option value="ANPR">ANPR High Speed</option>
                <option value="Thermal">Thermal / Infrared</option>
                <option value="Dome">Dome 360</option>
                <option value="Bullet">Bullet Outdoor</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Operational Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active Live Feed</option>
                <option value="Inactive">Offline / Disconnected</option>
                <option value="Maintenance">Maintenance Window</option>
              </select>
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Active Live Nodes:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {cameras.filter(c => c.status === 'Active').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">ANPR Enabled:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {cameras.filter(c => c.anpr_enabled || c.camera_type === 'ANPR').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Offline Nodes:</span>
              <span className="font-mono text-rose-400 font-bold">
                {cameras.filter(c => c.status !== 'Active').length}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Interactive Map (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <GISMapComponent
            cameras={cameras}
            selectedCamera={selectedCamera}
            onSelectCamera={(cam) => setSelectedCamera(cam)}
            showCoverageRadius={showCoverageRadius}
            height="h-[640px]"
            zoom={8}
          />
        </div>
      </div>
    </div>
  );
};
