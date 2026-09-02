'use client';

import React, { useEffect, useState } from 'react';
import { fetchLectures, createLecture, updateLecture, deleteLecture } from '@/lib/api';
import { Youtube, ExternalLink, Plus, Search, Filter, Trash2, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export default function DsaLecturesPage() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ srNo: '', title: '', url: '', duration: '', status: 'Pending' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLectures(statusFilter, search);
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLecture({
        ...formData,
        srNo: parseInt(formData.srNo) || lectures.length + 1,
      });
      setIsModalOpen(false);
      setFormData({ srNo: '', title: '', url: '', duration: '', status: 'Pending' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateLecture(item._id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lecture entry?')) {
      try {
        await deleteLecture(id);
        loadData();
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
          <div className="apple-badge badge-green font-semibold mb-2">
            <Youtube className="w-3.5 h-3.5" /> DSA Course Curriculum
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            DSA Lectures
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track video playlists, watch durations, and completion status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="apple-card-flat px-4 py-2 text-right">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Total Videos</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{lectures.length}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Lecture
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, URL..."
            className="w-full text-xs text-[var(--text-primary)] placeholder-gray-400 pl-9 pr-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] focus:outline-none focus:border-amber-500 dark:focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs text-[var(--text-primary)] px-3 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] focus:outline-none focus:border-amber-500 dark:focus:border-indigo-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="apple-card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-black/[0.03] dark:bg-white/[0.02] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--card-border)]">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">URL</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading lectures...</td>
                </tr>
              ) : lectures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No lectures found. Click &quot;Add Lecture&quot; or sync from Excel!</td>
                </tr>
              ) : (
                lectures.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <td className="p-3.5 text-center font-bold text-gray-400">{item.srNo || idx + 1}</td>
                    <td className="p-3.5 font-semibold text-[var(--text-primary)] max-w-xs truncate">{item.title}</td>
                    <td className="p-3.5 max-w-xs">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 dark:text-indigo-400 hover:underline flex items-center gap-1 text-xs truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {item.duration || 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`apple-badge cursor-pointer transition ${
                          item.status === 'Completed' ? 'badge-green' : 'badge-orange'
                        }`}
                      >
                        {item.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                        {item.status || 'Pending'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete lecture"
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
            <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4">Add DSA Lecture</h2>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dynamic Programming - 1D Array"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">YouTube / Video URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1h 24m"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
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
                  Save Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
