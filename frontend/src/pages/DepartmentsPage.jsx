import React, { useEffect, useState } from 'react';
import { departmentApi } from '../services/departmentApi';
import { DepartmentBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';
import { Building2, Shield, Camera, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getDepartments({ category: categoryFilter || undefined });
        setDepartments(res.data);
      } catch (e) {
        console.error('Failed to load departments:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, [categoryFilter]);

  if (loading) return <Loader message="Loading State Department Registry..." size="lg" />;

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              26 Government Departments Directory
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
              STATE GOVERNMENT GRID
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Department-level security domain boundaries, role-based access restrictions, and asset distribution
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search department by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none"
          >
            <option value="">All Categories ({departments.length})</option>
            <option value="Law Enforcement">Law Enforcement</option>
            <option value="Transport">Transport & Ports</option>
            <option value="Municipal">Municipal Corporations</option>
            <option value="Civil Supplies">Civil Supplies & Food</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Environment">Forest & Environment</option>
            <option value="Tourism">Tourism & Pilgrimage</option>
          </select>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(dept => (
          <div
            key={dept.id}
            onClick={() => navigate(`/registry?department=${dept.id}`)}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-600/60 cursor-pointer transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow"
                style={{
                  backgroundColor: `${dept.color || '#3b82f6'}20`,
                  borderColor: `${dept.color || '#3b82f6'}60`,
                  color: dept.color || '#60a5fa'
                }}
              >
                <Building2 className="w-5 h-5" />
              </div>

              <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-900 text-slate-300 border border-slate-700">
                {dept.code}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                {dept.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {dept.description || 'Gujarat State Government Departmental CCTV infrastructure domain.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Registered CCTV Nodes:</span>
              <span className="font-mono font-bold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                {dept.camera_count || 0} Cameras
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
