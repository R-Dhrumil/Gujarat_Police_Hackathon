import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  MapPin, 
  Clock, 
  Video,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AlertsPage = () => {
  const { alerts, acknowledgeAlert, triggerTestAlert } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('Acknowledged by duty officer. Unit dispatched.');
  const [severityFilter, setSeverityFilter] = useState('');
  const [unackOnly, setUnackOnly] = useState(false);
  const navigate = useNavigate();

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;
    await acknowledgeAlert(selectedAlert.id, resolutionNotes);
    setSelectedAlert(null);
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter && a.severity !== severityFilter) return false;
    if (unackOnly && a.is_acknowledged) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Real-Time Security Threat & Interception Alerts
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
              LIVE WEBSOCKET STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated hot-match alerts from ANPR scans, eGujCop watchlists, and camera stream connectivity failures
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerTestAlert(1, 'GJ01TEST999', 'CRITICAL')}
            className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-700/60 shadow-lg shadow-rose-950/40 transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse text-rose-400" />
            Simulate Tactical Alert
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter Severity:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {sev || 'All Alerts'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={unackOnly}
            onChange={(e) => setUnackOnly(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
          />
          <span>Show Unacknowledged Only</span>
        </label>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                !alert.is_acknowledged
                  ? 'border-rose-700/80 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 shadow-lg shadow-rose-950/20'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    !alert.is_acknowledged
                      ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${!alert.is_acknowledged ? 'animate-pulse' : ''}`} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <SeverityBadge severity={alert.severity} />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.is_acknowledged
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {alert.camera_code || 'Camera'} ({alert.district || 'Ahmedabad'})
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(alert.created_at).toLocaleString('en-IN', { hour12: true })}
                      </span>
                      {alert.acknowledged_by && (
                        <span className="text-emerald-400 text-[10px]">
                          Ack by: {alert.acknowledged_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  {alert.camera_id && (
                    <button
                      onClick={() => navigate(`/live-viewer?camera=${alert.camera_id}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      View Stream
                    </button>
                  )}

                  {!alert.is_acknowledged ? (
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
                    >
                      Acknowledge Threat
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
            No alerts match the selected criteria.
          </div>
        )}
      </div>

      {/* Acknowledge Alert Modal */}
      <Modal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title="Tactical Threat Acknowledgement & Dispatch Log"
      >
        {selectedAlert && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Alert Summary:</span>
              <p className="font-bold text-white text-sm">{selectedAlert.title}</p>
              <p className="text-slate-300">{selectedAlert.message}</p>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Duty Officer Tactical Notes / Action Taken</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcknowledge}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg"
              >
                Confirm Acknowledgement & Dispatch
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
