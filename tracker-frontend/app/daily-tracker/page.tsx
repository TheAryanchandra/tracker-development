'use client';

import { useEffect, useState } from 'react';
import { fetchDailyLogs, createDailyLog, updateDailyLog, deleteDailyLog } from '@/lib/api';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Briefcase,
  Code2,
  Bot,
  FileText,
  Trash2,
  X,
} from 'lucide-react';

export default function DailyTrackerPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dsaDone: true,
    dsaTopic: '',
    applicationsSent: 0,
    projectWork: true,
    project: '',
    aiLearning: true,
    notes: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchDailyLogs();
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, field: string, currentValue: boolean) => {
    try {
      const res = await updateDailyLog(id, { [field]: !currentValue });
      if (res.success) {
        setLogs((prev) =>
          prev.map((item) => (item._id === id ? { ...item, [field]: !currentValue } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    try {
      const res = await deleteDailyLog(id);
      if (res.success) {
        setLogs((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createDailyLog(formData);
      if (res.success) {
        setIsModalOpen(false);
        loadLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-indigo-400" />
            Daily Activity & Routine Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log daily progress across DSA topics, job applications, project development, and AI research.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Log Today's Activity
        </button>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">New Daily Activity Log</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applications Sent</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.applicationsSent}
                    onChange={(e) => setFormData({ ...formData, applicationsSent: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dsaDone}
                    onChange={(e) => setFormData({ ...formData, dsaDone: e.target.checked })}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-200">DSA Done</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.projectWork}
                    onChange={(e) => setFormData({ ...formData, projectWork: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-200">Project Work</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aiLearning}
                    onChange={(e) => setFormData({ ...formData, aiLearning: e.target.checked })}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-200">AI Learning</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">DSA Topic / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search - Rotated Sorted Array"
                  value={formData.dsaTopic}
                  onChange={(e) => setFormData({ ...formData, dsaTopic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI Tracker - Auth Service"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Watched 1 lecture + solved 3 LeetCode mediums"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table View */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">DSA Done</th>
                <th className="py-3.5 px-4">DSA Topic / Focus</th>
                <th className="py-3.5 px-4 text-center">Apps Sent</th>
                <th className="py-3.5 px-4 text-center">Project Work</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4 text-center">AI Learning</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Loading daily logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No daily logs found. Upload Excel or click "Log Today's Activity".
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                      {log.date}
                    </td>

                    {/* DSA Done Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggle(log._id, 'dsaDone', log.dsaDone)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] transition ${
                          log.dsaDone
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {log.dsaDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                        {log.dsaDone ? 'Y' : 'N'}
                      </button>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-300 max-w-xs truncate">
                      {log.dsaTopic || '-'}
                    </td>

                    <td className="py-4 px-4 text-center font-extrabold text-indigo-400">
                      {log.applicationsSent || 0}
                    </td>

                    {/* Project Work Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggle(log._id, 'projectWork', log.projectWork)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] transition ${
                          log.projectWork
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {log.projectWork ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                        {log.projectWork ? 'Y' : 'N'}
                      </button>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-300 max-w-xs truncate">
                      {log.project || '-'}
                    </td>

                    {/* AI Learning Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggle(log._id, 'aiLearning', log.aiLearning)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] transition ${
                          log.aiLearning
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {log.aiLearning ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> : <XCircle className="w-3.5 h-3.5" />}
                        {log.aiLearning ? 'Y' : 'N'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
