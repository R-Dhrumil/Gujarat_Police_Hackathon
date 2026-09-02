import React, { useEffect, useState } from 'react';
import { cameraApi } from '../services/cameraApi';
import { departmentApi } from '../services/departmentApi';
import { StatusBadge, DepartmentBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { 
  Plus, 
  UploadCloud, 
  Download, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Video,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Registry = () => {
  const [cameras, setCameras] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    camera_code: '',
    name: '',
    department_id: '',
    district: 'Ahmedabad',
    city: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    camera_type: 'IP',
    ownership: 'Government',
    status: 'Active',
    storage_type: 'Local NVR',
    retention_days: 15,
    landmark_address: ''
  });

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [camRes, deptRes] = await Promise.all([
        cameraApi.getCameras({
          search: search || undefined,
          department_id: selectedDept || undefined,
          status: selectedStatus || undefined,
          camera_type: selectedType || undefined
        }),
        departmentApi.getDepartments()
      ]);
      setCameras(camRes.data);
      setDepartments(deptRes.data);
      if (!formData.department_id && deptRes.data.length > 0) {
        setFormData(prev => ({ ...prev, department_id: deptRes.data[0].id }));
      }
    } catch (e) {
      console.error('Registry load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedStatus, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateCamera = async (e) => {
    e.preventDefault();
    try {
      await cameraApi.createCamera({
        ...formData,
        department_id: parseInt(formData.department_id),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        retention_days: parseInt(formData.retention_days)
      });
      setShowAddModal(false);
      loadData();
      alert(`Camera ${formData.camera_code} successfully registered.`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register camera');
    }
  };

  const handleDeleteCamera = async (id, code) => {
    if (window.confirm(`Are you sure you want to decommission camera ${code}?`)) {
      try {
        await cameraApi.deleteCamera(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete camera');
      }
    }
  };

  // Bulk Import Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFile(file);
    setBulkLoading(true);
    setBulkResult(null);

    try {
      const res = await cameraApi.bulkImportPreview(file);
      setBulkPreview(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to parse upload file');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleConfirmBulkImport = async () => {
    if (!bulkPreview || !bulkPreview.valid_rows) return;
    setBulkLoading(true);
    try {
      const rowsToInsert = bulkPreview.valid_rows.map(r => r.data);
      const res = await cameraApi.bulkImportConfirm(rowsToInsert, true, departments[0]?.id || 1);
      setBulkResult(res.data);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Bulk import failed');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Centralized CCTV Asset Registry
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
              MODEL 1 INVENTORY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Systematic identification, geographical mapping, and lifecycle management of state-wide camera assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={cameraApi.exportCSVUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <button
            onClick={() => {
              setBulkPreview(null);
              setBulkResult(null);
              setBulkFile(null);
              setShowBulkModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-blue-400" />
            Bulk CSV Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Camera
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Camera Code, Location, Landmark, or District..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Departments ({departments.length})</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Camera Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Camera Types</option>
            <option value="IP">IP Camera</option>
            <option value="PTZ">PTZ Camera</option>
            <option value="ANPR">ANPR Camera</option>
            <option value="Dome">Dome Camera</option>
            <option value="Bullet">Bullet Camera</option>
            <option value="Thermal">Thermal Camera</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive / Offline</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Main Cameras Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1222] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Camera Asset</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">District / City</th>
                <th className="px-4 py-3.5">Hardware / Type</th>
                <th className="px-4 py-3.5">Coordinates</th>
                <th className="px-4 py-3.5">Storage</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <Loader message="Fetching camera asset registry..." />
                  </td>
                </tr>
              ) : cameras.length > 0 ? (
                cameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                          {cam.camera_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{cam.name}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <DepartmentBadge name={cam.department_name} color={cam.department_color} />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200">{cam.district}</div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{cam.landmark_address || cam.city}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {cam.camera_type}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cam.resolution || '1080p'}</p>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {cam.latitude?.toFixed(4)}, {cam.longitude?.toFixed(4)}
                    </td>

                    <td className="px-4 py-3.5 text-[11px]">
                      <span className="text-slate-300 block">{cam.storage_type}</span>
                      <span className="text-slate-500 text-[10px]">{cam.retention_days} Days Retention</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={cam.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/live-viewer?camera=${cam.id}`)}
                          className="p-1.5 rounded-lg bg-blue-950 text-blue-400 hover:bg-blue-900 transition-colors"
                          title="View Live Stream"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCamera(cam.id, cam.camera_code)}
                          className="p-1.5 rounded-lg bg-rose-950 text-rose-400 hover:bg-rose-900 transition-colors"
                          title="Delete Camera"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 text-xs">
                    No camera records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Manual Add Camera Modal ---------------- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New CCTV Asset (Model 1)">
        <form onSubmit={handleCreateCamera} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Camera Code (Unique)</label>
              <input
                type="text"
                required
                placeholder="e.g. CAM-AHM-POL-099"
                value={formData.camera_code}
                onChange={(e) => setFormData({ ...formData, camera_code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Camera Name / Label</label>
              <input
                type="text"
                required
                placeholder="e.g. C.G. Road Axis Bank Junction"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Government Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Camera Hardware Type</label>
              <select
                value={formData.camera_type}
                onChange={(e) => setFormData({ ...formData, camera_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="IP">IP Camera</option>
                <option value="PTZ">PTZ Camera</option>
                <option value="ANPR">ANPR Camera</option>
                <option value="Dome">Dome Camera</option>
                <option value="Bullet">Bullet Camera</option>
                <option value="Thermal">Thermal Camera</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">District</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Landmark / Street Address</label>
              <input
                type="text"
                placeholder="e.g. Near Kalupur Gate"
                value={formData.landmark_address}
                onChange={(e) => setFormData({ ...formData, landmark_address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Latitude (Gujarat: ~20.0 to 24.8)</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Longitude (Gujarat: ~68.0 to 74.5)</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Storage Type</label>
              <select
                value={formData.storage_type}
                onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Local NVR">Local NVR</option>
                <option value="Edge SD">Edge SD</option>
                <option value="Cloud">Department Cloud</option>
                <option value="State DC">State Data Center</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Retention (Days)</label>
              <input
                type="number"
                value={formData.retention_days}
                onChange={(e) => setFormData({ ...formData, retention_days: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
            >
              Save Camera Asset
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------- Bulk CSV Upload & 2-Step Preview Modal ---------------- */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Camera Inventory Onboarding (Model 1)">
        <div className="space-y-4">
          {!bulkPreview && !bulkResult && (
            <div className="p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl text-center bg-slate-900/40 space-y-3 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-blue-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Upload Departmental CSV / Excel Dataset</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supports columns: <code>camera_code, name, department, latitude, longitude, camera_type, status, storage_type, retention_days</code>
                </p>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-cctv-upload"
              />
              <label
                htmlFor="bulk-cctv-upload"
                className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Select CSV / Excel File
              </label>
            </div>
          )}

          {bulkLoading && <Loader message="Validating coordinates, enums, and departmental taxonomy..." />}

          {/* Validation Preview Step */}
          {bulkPreview && !bulkResult && !bulkLoading && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Validation Summary</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {bulkPreview.valid_rows_count} Valid Records Ready · {bulkPreview.invalid_rows_count} Erroneous Rows Flagged
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                    {bulkPreview.valid_rows_count} Valid
                  </span>
                  {bulkPreview.invalid_rows_count > 0 && (
                    <span className="px-3 py-1 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 text-xs font-bold">
                      {bulkPreview.invalid_rows_count} Invalid
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-[300px] overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Row</th>
                      <th className="p-2">Camera Code</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Lat, Lon</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bulkPreview.valid_rows.map(r => (
                      <tr key={r.row_number} className="bg-slate-950/40">
                        <td className="p-2 text-slate-500">#{r.row_number}</td>
                        <td className="p-2 font-mono font-bold text-white">{r.data.camera_code}</td>
                        <td className="p-2">{r.data.department_str}</td>
                        <td className="p-2 font-mono text-slate-400">{r.data.latitude?.toFixed(4)}, {r.data.longitude?.toFixed(4)}</td>
                        <td className="p-2 text-emerald-400 font-semibold">Valid</td>
                      </tr>
                    ))}
                    {bulkPreview.invalid_rows.map(r => (
                      <tr key={r.row_number} className="bg-rose-950/20">
                        <td className="p-2 text-rose-400">#{r.row_number}</td>
                        <td className="p-2 font-mono text-rose-300">{r.data.camera_code || 'MISSING'}</td>
                        <td className="p-2 text-rose-300">{r.data.department_str}</td>
                        <td className="p-2 font-mono text-rose-300">{r.data.latitude}, {r.data.longitude}</td>
                        <td className="p-2 text-rose-400 font-semibold">{r.errors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setBulkPreview(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleConfirmBulkImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg"
                >
                  Confirm & Commit {bulkPreview.valid_rows_count} Cameras
                </button>
              </div>
            </div>
          )}

          {/* Import Result */}
          {bulkResult && (
            <div className="p-6 text-center space-y-3 bg-emerald-950/30 border border-emerald-800 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Bulk Onboarding Completed Successfully!</h4>
              <p className="text-xs text-slate-300">
                Inserted <strong>{bulkResult.inserted_count}</strong> new cameras, updated <strong>{bulkResult.updated_count}</strong> existing records.
              </p>
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Close and View Registry
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
