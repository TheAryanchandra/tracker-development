'use client';

import React, { useEffect, useState } from 'react';
import { fetchDsaProgress, createDsaProgress, updateDsaProgress, deleteDsaProgress } from '@/lib/api';
import { BarChart3, Plus, Trash2, CheckCircle2, Edit2 } from 'lucide-react';

export default function DsaProgressPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ totalProblems: 0, problemsSolved: 0 });

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await fetchDsaProgress();
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleStartEdit = (item: any) => {
    setEditingId(item._id);
    setEditForm({ totalProblems: item.totalProblems || 0, problemsSolved: item.problemsSolved || 0 });
  };

  const handleSaveEdit = async (id: string) => {
    const total = editForm.totalProblems;
    const solved = editForm.problemsSolved;
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    const status = solved >= total && total > 0 ? 'Completed' : solved > 0 ? 'In Progress' : 'Add problem count';

    try {
      await updateDsaProgress(id, {
        totalProblems: total,
        problemsSolved: solved,
        percentComplete: percent,
        status,
      });
      setEditingId(null);
      loadTopics();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
      {/* Header Banner */}
      <div className="apple-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="apple-badge badge-green font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Topic-wise DSA Mastery
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            DSA Progress Tracker
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track solved problems, completion percentages, and topic-wise readiness across standard topics.
          </p>
        </div>

        <div className="apple-card-flat px-4 py-2 text-right">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Tracked Topics</p>
          <p className="text-lg font-black text-amber-700 dark:text-indigo-400">{topics.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="apple-card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-black/[0.03] dark:bg-white/[0.02] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--card-border)]">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">Topic</th>
                <th className="p-3.5 text-center">Total Target</th>
                <th className="p-3.5 text-center">Problems Solved</th>
                <th className="p-3.5">Progress %</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading topic progress...</td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No topics seeded. Re-sync your Excel sheet in the sidebar!</td>
                </tr>
              ) : (
                topics.map((item, idx) => {
                  const isEditing = editingId === item._id;
                  return (
                    <tr key={item._id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                      <td className="p-3.5 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-[var(--text-primary)]">{item.topic}</td>
                      <td className="p-3.5 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.totalProblems}
                            onChange={(e) => setEditForm({ ...editForm, totalProblems: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-[var(--input-bg)] border border-[var(--card-border)] text-center text-xs"
                          />
                        ) : (
                          <span className="text-[var(--text-secondary)] font-medium">{item.totalProblems || 0}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-700 dark:text-indigo-400">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.problemsSolved}
                            onChange={(e) => setEditForm({ ...editForm, problemsSolved: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 rounded bg-[var(--input-bg)] border border-[var(--card-border)] text-center text-xs"
                          />
                        ) : (
                          item.problemsSolved || 0
                        )}
                      </td>
                      <td className="p-3.5 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-black/[0.08] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(item.percentComplete || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[var(--text-secondary)] w-8 text-right">
                            {item.percentComplete || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`apple-badge ${
                          item.percentComplete >= 100
                            ? 'badge-green'
                            : item.problemsSolved > 0
                            ? 'badge-blue'
                            : 'badge-dim'
                        }`}>
                          {item.status || (item.problemsSolved > 0 ? 'In Progress' : 'Not Started')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(item._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                            title="Edit topic numbers"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
