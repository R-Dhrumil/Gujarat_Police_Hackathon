import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader } from '../components/common/Loader';
import { History, Shield, User, Clock, FileText, Search } from 'lucide-react';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await api.get('/audit', { params: { limit: 100 } });
        setLogs(res.data);
      } catch (e) {
        console.error('Audit fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  if (loading) return <Loader message="Loading Security Audit Trail..." size="lg" />;

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource_type.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Security Compliance & Operational Audit Trail
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              IMMUTABLE LOGS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of user logins, camera access, stream sessions, watchlist modifications, and alert acknowledgments
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user, action, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filtered.length} Audit Entries</span>
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1222] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Operator / User</th>
                <th className="px-4 py-3.5">Action Executed</th>
                <th className="px-4 py-3.5">Resource Domain</th>
                <th className="px-4 py-3.5">Operational Details</th>
                <th className="px-4 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString('en-IN', { hour12: true })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-white block">{log.user_name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-900 text-blue-400 border border-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {log.details || 'Action completed successfully.'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
