'use client';

import { useEffect, useState } from 'react';
import { fetchDsaProgress, updateDsaProgress, createDsaProgress, deleteDsaProgress } from '@/lib/api';
import {
  BarChart3,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Trash2,
} from 'lucide-react';

export default function DsaProgressPage() {
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit inline modal state
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await fetchDsaProgress();
      if (res.success) setProgressList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const total = parseInt(editingItem.totalProblems) || 0;
      const solved = parseInt(editingItem.problemsSolved) || 0;

      const res = await updateDsaProgress(editingItem._id, {
        totalProblems: total,
        problemsSolved: solved,
        status: editingItem.status || (solved >= total && total > 0 ? 'Completed' : 'In Progress'),
      });

      if (res.success) {
        setEditingItem(null);
        loadProgress();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName) return;
    try {
      const res = await createDsaProgress({
        topic: newTopicName,
        totalProblems: 0,
        problemsSolved: 0,
        percentComplete: 0,
        status: 'Add problem count',
      });
      if (res.success) {
        setIsModalOpen(false);
        setNewTopicName('');
        loadProgress();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this topic?')) return;
    try {
      const res = await deleteDsaProgress(id);
      if (res.success) {
        setProgressList((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const grandTotalProblems = progressList.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0);
  const grandSolvedProblems = progressList.reduce((acc, curr) => acc + (curr.problemsSolved || 0), 0);
  const overallPercent = grandTotalProblems > 0 ? Math.round((grandSolvedProblems / grandTotalProblems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            DSA Topic Progress & Roadmap
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track solved vs target problem counts across 18 DSA categories with live % calculations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Add Custom DSA Topic
        </button>
      </div>

      {/* Overall Progress Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall DSA Completion
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-extrabold text-white">{grandSolvedProblems}</span>
            <span className="text-sm text-slate-400">/ {grandTotalProblems} Problems Solved</span>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-300">Target Readiness</span>
            <span className="text-emerald-400">{overallPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Modal: Add Topic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add Custom Topic</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddNewTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Segment Trees & Disjoint Set"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                />
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
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Counts */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Edit Topic: <span className="text-indigo-400">{editingItem.topic}</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Target Problems</label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.totalProblems}
                  onChange={(e) => setEditingItem({ ...editingItem, totalProblems: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Problems Solved</label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.problemsSolved}
                  onChange={(e) => setEditingItem({ ...editingItem, problemsSolved: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <input
                  type="text"
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                  placeholder="Add problem count / In Progress / Completed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                >
                  Update Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Topic</th>
                <th className="py-3.5 px-4 text-center">Total Problems</th>
                <th className="py-3.5 px-4 text-center">Problems Solved</th>
                <th className="py-3.5 px-5 w-48 text-center">% Complete</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading DSA progress topics...
                  </td>
                </tr>
              ) : progressList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No topics found. Upload Excel or click "Add Custom DSA Topic".
                  </td>
                </tr>
              ) : (
                progressList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-5 font-bold text-slate-200">{item.topic}</td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-400">
                      {item.totalProblems || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-emerald-400">
                      {item.problemsSolved || 0}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.percentComplete === 100
                                ? 'bg-emerald-400'
                                : item.percentComplete > 50
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.percentComplete || 0}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-bold text-slate-300">
                          {item.percentComplete || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          item.percentComplete === 100
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.totalProblems === 0
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        {item.status || 'Add problem count'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-1">
                      <button
                        onClick={() => setEditingItem({ ...item })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                        title="Edit Counts"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Delete Topic"
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
