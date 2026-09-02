'use client';

import React, { useEffect, useState } from 'react';
import { fetchDailyLogs, createDailyLog, updateDailyLog, deleteDailyLog } from '@/lib/api';
import { CalendarCheck, Plus, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function DailyTrackerPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dsaDone: false,
    dsaTopic: '',
    applicationsSent: 0,
    projectWork: false,
    project: '',
    aiLearning: false,
    notes: '',
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDailyLog(formData);
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        dsaDone: false,
        dsaTopic: '',
        applicationsSent: 0,
        projectWork: false,
        project: '',
        aiLearning: false,
        notes: '',
      });
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this daily log entry?')) {
      try {
        await deleteDailyLog(id);
        loadLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
      {/* Header Banner */}
      <div className="apple-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="apple-badge badge-purple font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" /> Daily Growth Logs
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Daily Tracker
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Log daily progress across DSA topics, job applications, project milestones, and AI learning.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Daily Log
        </button>
      </div>

      {/* Table */}
      <div className="apple-card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-black/[0.03] dark:bg-white/[0.02] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--card-border)]">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-center">DSA Done</th>
                <th className="p-3.5">DSA Topic</th>
                <th className="p-3.5 text-center">Apps Sent</th>
                <th className="p-3.5 text-center">Project Work</th>
                <th className="p-3.5">Project Details</th>
                <th className="p-3.5 text-center">AI Learning</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">Loading daily logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">No logs found. Click &quot;Add Daily Log&quot; or sync from Excel!</td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <td className="p-3.5 font-bold text-[var(--text-primary)] whitespace-nowrap">{item.date}</td>
                    <td className="p-3.5 text-center">
                      {item.dsaDone ? (
                        <span className="apple-badge badge-green">Yes</span>
                      ) : (
                        <span className="apple-badge badge-dim">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] font-medium">{item.dsaTopic || '—'}</td>
                    <td className="p-3.5 text-center font-bold text-amber-700 dark:text-indigo-400">
                      {item.applicationsSent || 0}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.projectWork ? (
                        <span className="apple-badge badge-purple">Yes</span>
                      ) : (
                        <span className="apple-badge badge-dim">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] max-w-xs truncate">{item.project || '—'}</td>
                    <td className="p-3.5 text-center">
                      {item.aiLearning ? (
                        <span className="apple-badge badge-blue">Yes</span>
                      ) : (
                        <span className="apple-badge badge-dim">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] max-w-xs truncate">{item.notes || '—'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up">
          <div className="apple-card w-full max-w-md p-6 border border-[var(--card-border)] bg-[var(--modal-bg)] shadow-2xl">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4">Add Daily Log Entry</h2>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">Date *</label>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="29-Aug-2026"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">DSA Done?</label>
                  <select
                    value={formData.dsaDone ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, dsaDone: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">Apps Sent (Count)</label>
                  <input
                    type="number"
                    value={formData.applicationsSent}
                    onChange={(e) => setFormData({ ...formData, applicationsSent: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">DSA Topic</label>
                <input
                  type="text"
                  value={formData.dsaTopic}
                  onChange={(e) => setFormData({ ...formData, dsaTopic: e.target.value })}
                  placeholder="e.g. Dynamic Programming, Trees"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">Project Work?</label>
                  <select
                    value={formData.projectWork ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, projectWork: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">AI Learning?</label>
                  <select
                    value={formData.aiLearning ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, aiLearning: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">Project Details</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Backend microservice, API refactoring..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Daily takeaways..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 dark:bg-indigo-600 text-white font-bold hover:bg-amber-500 dark:hover:bg-indigo-500 transition"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
