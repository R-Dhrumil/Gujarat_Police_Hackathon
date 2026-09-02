import React, { useEffect, useState } from 'react';
import { vmsApi } from '../services/vmsApi';
import { departmentApi } from '../services/departmentApi';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { 
  Server, 
  Plus, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Network, 
  Shield, 
  Trash2,
  Sliders
} from 'lucide-react';

export const VMSSystemsPage = () => {
  const [vmsList, setVmsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResponse, setTestResponse] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    vendor: 'Milestone XProtect',
    host: '10.200.1.10',
    port: 8554,
    protocol: 'RTSP',
    description: ''
  });

  const loadVMS = async () => {
    setLoading(true);
    try {
      const [vmsRes, deptRes] = await Promise.all([
        vmsApi.getVMSSystems(),
        departmentApi.getDepartments()
      ]);
      setVmsList(vmsRes.data);
      setDepartments(deptRes.data);
      if (deptRes.data.length > 0 && !formData.department_id) {
        setFormData(prev => ({ ...prev, department_id: deptRes.data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load VMS:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVMS();
  }, []);

  const handleTestConnection = async (id) => {
    setTestingId(id);
    setTestResponse(null);
    try {
      const res = await vmsApi.testConnection(id);
      setTestResponse(res.data);
    } catch (err) {
      alert('VMS gateway connection test failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateVMS = async (e) => {
    e.preventDefault();
    try {
      await vmsApi.createVMS({
        ...formData,
        department_id: parseInt(formData.department_id),
        port: parseInt(formData.port)
      });
      setShowAddModal(false);
      loadVMS();
      alert(`VMS Gateway ${formData.name} successfully registered.`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create VMS');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Heterogeneous VMS Gateways & Stream Consumers
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              MODEL 2 VMS INTEGRATIONS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pluggable connectors for independent departmental VMS platforms (Milestone, Genetec, Matrix, Dahua, Hikvision)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register VMS System
        </button>
      </div>

      {/* Test Response Banner */}
      {testResponse && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">{testResponse.name} - Connection Active</span>
              <span className="text-[11px] text-emerald-300">{testResponse.message} (Latency: {testResponse.latency_ms}ms)</span>
            </div>
          </div>
          <button onClick={() => setTestResponse(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* VMS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vmsList.map(vms => (
          <div
            key={vms.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{vms.name}</h4>
                  <p className="text-[11px] text-slate-400">{vms.department_name || 'Police Department'}</p>
                </div>
              </div>
              <StatusBadge status={vms.connection_status} />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor Platform:</span>
                <span className="text-white">{vms.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Address:</span>
                <span className="text-blue-400">{vms.host}:{vms.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transport:</span>
                <span>{vms.protocol} (TCP Mode)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Attached Feeds:</span>
              <span className="font-bold text-white">{vms.camera_count || 0} Cameras</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleTestConnection(vms.id)}
                disabled={testingId === vms.id}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                {testingId === vms.id ? (
                  <Loader message="" size="sm" />
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Test Stream Handshake
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add VMS Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Departmental VMS Gateway">
        <form onSubmit={handleCreateVMS} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">VMS System Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Surat Smart City VMS Node"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">System Code</label>
              <input
                type="text"
                required
                placeholder="e.g. VMS-SMC-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Vendor VMS Platform</label>
              <select
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="Milestone XProtect">Milestone XProtect</option>
                <option value="Genetec Security Center">Genetec Security Center</option>
                <option value="Matrix SATATYA">Matrix SATATYA</option>
                <option value="Hikvision iVMS-5200">Hikvision iVMS-5200</option>
                <option value="Dahua DSS Pro">Dahua DSS Pro</option>
                <option value="Generic ONVIF Gateway">Generic ONVIF Gateway</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Gateway Host / IP</label>
              <input
                type="text"
                required
                placeholder="e.g. 10.200.5.50 or vms.police.gujarat.gov.in"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">RTSP Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg"
            >
              Save VMS System
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
