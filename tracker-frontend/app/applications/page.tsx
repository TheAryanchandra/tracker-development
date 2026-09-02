'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  uploadResumeFile,
} from '@/lib/api';
import {
  Briefcase,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  Building,
  Globe,
  Paperclip,
  ExternalLink,
  FileText,
  Upload,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://127.0.0.1:5000';

export default function ApplicationTrackerPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    srNo: '',
    dateApplied: new Date().toISOString().split('T')[0],
    company: '',
    role: '',
    platform: 'LinkedIn',
    status: 'Applied',
    followUpDate: '',
    notes: '',
    resumeUrl: '',
    attachmentName: '',
  });

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications(statusFilter, search);
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [search, statusFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadedUrl = formData.resumeUrl;
      let uploadedName = formData.attachmentName;

      if (resumeFile) {
        setUploadingResume(true);
        const res = await uploadResumeFile(resumeFile);
        if (res.success) {
          uploadedUrl = res.fileUrl;
          uploadedName = res.fileName;
        }
        setUploadingResume(false);
      }

      await createApplication({
        ...formData,
        srNo: parseInt(formData.srNo) || apps.length + 1,
        resumeUrl: uploadedUrl,
        attachmentName: uploadedName,
      });

      setIsModalOpen(false);
      setResumeFile(null);
      setFormData({
        srNo: '',
        dateApplied: new Date().toISOString().split('T')[0],
        company: '',
        role: '',
        platform: 'LinkedIn',
        status: 'Applied',
        followUpDate: '',
        notes: '',
        resumeUrl: '',
        attachmentName: '',
      });
      loadApps();
    } catch (err) {
      console.error(err);
      setUploadingResume(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this application entry?')) {
      try {
        await deleteApplication(id);
        loadApps();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Offer':
        return 'badge-green';
      case 'Interviewing':
        return 'badge-purple';
      case 'Applied':
        return 'badge-blue';
      case 'Follow-up Pending':
        return 'badge-orange';
      default:
        return 'badge-dim';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
      {/* Header Banner */}
      <div className="apple-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="apple-badge badge-blue font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Career Application Pipeline
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track company applications, interview rounds, and attach resumes saved to cloud & MongoDB.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, platform..."
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
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Follow-up Pending">Follow-up Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="apple-card overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-black/[0.03] dark:bg-white/[0.02] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--card-border)]">
              <tr>
                <th className="p-3.5 w-10 text-center">#</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Follow-up</th>
                <th className="p-3.5">Resume / Doc</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    Loading applications...
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    No applications logged. Add one or sync Excel sheet!
                  </td>
                </tr>
              ) : (
                apps.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition"
                  >
                    <td className="p-3.5 text-center font-bold text-gray-400">
                      {item.srNo || idx + 1}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] whitespace-nowrap">
                      {item.dateApplied}
                    </td>
                    <td className="p-3.5 font-bold text-[var(--text-primary)]">
                      {item.company}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)]">{item.role}</td>
                    <td className="p-3.5">
                      <span className="apple-badge badge-dim">{item.platform}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`apple-badge ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] whitespace-nowrap">
                      {item.followUpDate || '—'}
                    </td>
                    <td className="p-3.5">
                      {item.resumeUrl ? (
                        <a
                          href={
                            item.resumeUrl.startsWith('http')
                              ? item.resumeUrl
                              : `${BACKEND_URL}${item.resumeUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-indigo-400 hover:underline"
                        >
                          <FileText size={12} /> View File
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)] max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete application"
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

      {/* Add Application Modal with Resume File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up">
          <div className="apple-card w-full max-w-md p-6 border border-[var(--card-border)] bg-[var(--modal-bg)] shadow-2xl">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4">
              Add Job Application
            </h2>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                    # Serial No
                  </label>
                  <input
                    type="number"
                    value={formData.srNo}
                    onChange={(e) => setFormData({ ...formData, srNo: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                    Date Applied *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dateApplied}
                    onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                    placeholder="29-Aug-2026"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google, Atlassian"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                  Role / Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Full Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="LinkedIn"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Follow-up Pending">Follow-up Pending</option>
                  </select>
                </div>
              </div>

              {/* Multer Resume Upload Input */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium flex items-center gap-1">
                  <Paperclip size={12} /> Attach Resume / Document (PDF, DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                  Follow-up Date
                </label>
                <input
                  type="text"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  placeholder="05-Sep-2026"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-medium">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Recruiter contact, round details..."
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
                  disabled={uploadingResume}
                  className="px-5 py-2 rounded-xl bg-amber-600 dark:bg-indigo-600 text-white font-bold hover:bg-amber-500 dark:hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {uploadingResume ? 'Uploading...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
