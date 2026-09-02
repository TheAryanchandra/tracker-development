'use client';

import { useEffect, useState } from 'react';
import { fetchApplications, createApplication, updateApplication, deleteApplication } from '@/lib/api';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Building2,
  ExternalLink,
  Trash2,
  X,
  Filter,
  Kanban,
  List,
} from 'lucide-react';

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    srNo: '',
    dateApplied: new Date().toISOString().split('T')[0],
    company: '',
    role: '',
    platform: 'LinkedIn',
    status: 'Applied',
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchApplications(statusFilter, search);
      if (res.success) setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateApplication(id, { status: newStatus });
      if (res.success) {
        setApplications((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;
    try {
      const res = await deleteApplication(id);
      if (res.success) {
        setApplications((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createApplication({
        ...formData,
        srNo: formData.srNo ? parseInt(formData.srNo) : applications.length + 1,
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          srNo: '',
          dateApplied: new Date().toISOString().split('T')[0],
          company: '',
          role: '',
          platform: 'LinkedIn',
          status: 'Applied',
          followUpDate: '',
          notes: '',
        });
        loadApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Follow-up Pending'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-amber-400" />
            Job Application Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track job applications, interview stages, referral statuses, and follow-up dates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" /> Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-4 h-4" /> Kanban
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {['', ...statuses].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Application */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">New Job Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Amazon, Startup"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Position</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Applied</label>
                  <input
                    type="text"
                    required
                    placeholder="29-Aug-2026"
                    value={formData.dateApplied}
                    onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
                  <input
                    type="text"
                    placeholder="LinkedIn, Indeed..."
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-up Date</label>
                <input
                  type="text"
                  placeholder="05-Sep-2026"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Applied via job post, referral pending..."
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
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Mode 1: Table */}
      {viewMode === 'list' ? (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Date Applied</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Follow-up Date</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Loading job applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No job applications found. Upload Excel from Admin or click "Add Application".
                    </td>
                  </tr>
                ) : (
                  applications.map((app, idx) => (
                    <tr key={app._id || idx} className="hover:bg-slate-900/50 transition">
                      <td className="py-4 px-4 text-center font-bold text-slate-400">
                        {app.srNo || idx + 1}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-300 whitespace-nowrap">
                        {app.dateApplied}
                      </td>
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        {app.company}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">{app.role}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-medium">
                          {app.platform || 'LinkedIn'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={app.status || 'Applied'}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none ${
                            app.status === 'Interviewing'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                              : app.status === 'Offer'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : app.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : app.status === 'Follow-up Pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st} className="bg-slate-900">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4 text-amber-400 font-medium flex items-center gap-1.5 mt-2">
                        {app.followUpDate ? (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            {app.followUpDate}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                        {app.notes || '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(app._id)}
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
      ) : (
        /* View Mode 2: Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((statusKey) => {
            const items = applications.filter((a) => a.status === statusKey);
            return (
              <div key={statusKey} className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col h-full">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                  <h3 className="font-bold text-sm text-slate-200">{statusKey}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-indigo-400">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {items.map((app) => (
                    <div key={app._id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-xs">{app.company}</h4>
                        <span className="text-[10px] text-slate-400">{app.dateApplied}</span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium">{app.role}</p>
                      {app.followUpDate && (
                        <p className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {app.followUpDate}
                        </p>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-6">No applications in this stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
