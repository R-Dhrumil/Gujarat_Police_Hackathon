import React, { useEffect, useState } from 'react';
import { watchlistApi } from '../services/watchlistApi';
import { SeverityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { 
  ListFilter, 
  Plus, 
  Shield, 
  Search, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  CheckCircle2, 
  Car,
  FileText
} from 'lucide-react';

export const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    plate_number: '',
    vehicle_owner: '',
    vehicle_description: '',
    reason: 'Stolen Vehicle Reported',
    category: 'eGujCop CCTNS Platform',
    priority: 'HIGH',
    source_database: 'eGujCop',
    fir_number: ''
  });

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const res = await watchlistApi.getWatchlist();
      setWatchlist(res.data);
    } catch (e) {
      console.error('Failed to load watchlist:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    try {
      await watchlistApi.addToWatchlist(formData);
      setShowAddModal(false);
      loadWatchlist();
      alert(`Vehicle ${formData.plate_number} added to surveillance watchlist.`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add watchlist record');
    }
  };

  const handleDelete = async (id, plate) => {
    if (window.confirm(`Remove ${plate} from active surveillance watchlist?`)) {
      try {
        await watchlistApi.deleteWatchlist(id);
        loadWatchlist();
      } catch (err) {
        alert('Failed to remove watchlist item');
      }
    }
  };

  const filtered = watchlist.filter(w => 
    w.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    w.reason.toLowerCase().includes(search.toLowerCase()) ||
    w.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Law Enforcement Vehicle Watchlist & CCTNS Integrations
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
              eGujCop · VAHAN · NAFIS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Targeted hotlist database linked with police FIR registries, stolen vehicles, wanted suspects, and judicial warrants
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle to Watchlist
        </button>
      </div>

      {/* Watchlist Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search watchlist by plate or FIR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">{filtered.length} Active Target Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1222] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Target Plate</th>
                <th className="px-4 py-3.5">Category & Source</th>
                <th className="px-4 py-3.5">Flagged Reason</th>
                <th className="px-4 py-3.5">FIR / Case Reference</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Live Sightings Match</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader message="Fetching watchlist records..." />
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-white tracking-widest text-xs">
                        {item.plate_number}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.vehicle_description || 'Vehicle'}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200 block">{item.category}</span>
                      <span className="text-[10px] text-slate-500">Source: {item.source_database}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {item.reason}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-blue-400">
                      {item.fir_number || 'SOG-REF-2024'}
                    </td>

                    <td className="px-4 py-3.5">
                      <SeverityBadge severity={item.priority} />
                    </td>

                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                      {item.match_count || 0} Sightings
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.plate_number)}
                        className="p-1.5 rounded-lg bg-rose-950 text-rose-400 hover:bg-rose-900 transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 text-xs">
                    No watchlist records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Watchlist Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Vehicle to Surveillance Watchlist">
        <form onSubmit={handleCreateWatchlist} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">License Plate Number</label>
              <input
                type="text"
                required
                placeholder="e.g. GJ01AB1234"
                value={formData.plate_number}
                onChange={(e) => setFormData({ ...formData, plate_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Threat Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="CRITICAL">CRITICAL (Immediate Tactical Intercept)</option>
                <option value="HIGH">HIGH (Wanted / eGujCop FIR Match)</option>
                <option value="MEDIUM">MEDIUM (Suspicious Movement)</option>
                <option value="LOW">LOW (Informational Track)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Flagging Reason / Crime Section</label>
            <input
              type="text"
              required
              placeholder="e.g. Stolen Vehicle Reported under IPC 379"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Database Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="eGujCop CCTNS Platform">eGujCop CCTNS Platform</option>
                <option value="VAHAN Stolen Registry">VAHAN Stolen Registry</option>
                <option value="AFIS / NAFIS Fingerprint Linked">AFIS / NAFIS Fingerprint Linked</option>
                <option value="Police Intelligence Hotlist">Police Intelligence Hotlist</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">FIR / Reference Number</label>
              <input
                type="text"
                placeholder="e.g. FIR-2024-AHM-491"
                value={formData.fir_number}
                onChange={(e) => setFormData({ ...formData, fir_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
            >
              Add Target to Watchlist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
