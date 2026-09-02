'use client';

import { useEffect, useState } from 'react';
import { fetchLectures, createLecture, updateLecture, deleteLecture } from '@/lib/api';
import {
  Youtube,
  Search,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  X,
  Filter,
} from 'lucide-react';

export default function DsaLecturesPage() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    srNo: '',
    url: '',
    title: '',
    duration: '',
    status: 'Pending',
  });

  useEffect(() => {
    loadLectures();
  }, [statusFilter]);

  const loadLectures = async () => {
    try {
      setLoading(true);
      const res = await fetchLectures(statusFilter, search);
      if (res.success) setLectures(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLectures();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateLecture(id, { status: newStatus });
      if (res.success) {
        setLectures((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await deleteLecture(id);
      if (res.success) {
        setLectures((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createLecture({
        ...formData,
        srNo: formData.srNo ? parseInt(formData.srNo) : lectures.length + 1,
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ srNo: '', url: '', title: '', duration: '', status: 'Pending' });
        loadLectures();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extract Youtube Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Youtube className="w-7 h-7 text-red-500" />
            DSA Course Curriculum & Video Lectures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete Java & DSA course playlist with status tracking and embedded video player.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Add New Lecture
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lecture title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === '' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" /> Video Player
              </h3>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={getEmbedUrl(activeVideoUrl)}
                title="Lecture Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-base">Add New DSA Lecture</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DSA In Java | Arrays"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4h 18m 1s"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
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
                  Save Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lectures Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Loading lectures...
                  </td>
                </tr>
              ) : lectures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No lectures found. Upload an Excel file or click "Add New Lecture".
                  </td>
                </tr>
              ) : (
                lectures.map((lecture, idx) => (
                  <tr key={lecture._id || idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {lecture.srNo || idx + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200 max-w-md">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveVideoUrl(lecture.url)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition flex-shrink-0"
                          title="Play Video"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="truncate">{lecture.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {lecture.duration || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={lecture.status || 'Pending'}
                        onChange={(e) => handleStatusChange(lecture._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none ${
                          lecture.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : lecture.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Pending" className="bg-slate-900">Pending</option>
                        <option value="In Progress" className="bg-slate-900">In Progress</option>
                        <option value="Completed" className="bg-slate-900">Completed</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <a
                        href={lecture.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(lecture._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Delete"
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
