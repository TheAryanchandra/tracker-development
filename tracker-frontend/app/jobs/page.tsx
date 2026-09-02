'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Search,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

interface Job {
  _id?: string;
  title: string;
  company: string;
  location: string;
  type?: string;
  tags?: string[];
  salary?: string;
  url: string;
  source: string;
  postedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sources, setSources] = useState<string[]>(['all']);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchJobs = useCallback(
    async (currentPage = 1, currentLimit = 10, q = '', src = '', refresh = false) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(currentLimit),
        });
        if (q.trim()) queryParams.set('q', q.trim());
        if (src && src !== 'all') queryParams.set('source', src);
        if (refresh) queryParams.set('refresh', 'true');

        const res = await fetch(`${API}/notifications/jobs?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setJobs(data.data || []);
          if (data.pagination) setPagination(data.pagination);
          if (data.sources) setSources(data.sources);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchJobs(page, limit, search, sourceFilter);
  }, [page, limit, sourceFilter, fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(1, limit, search, sourceFilter);
  };

  const handleSourceChange = (src: string) => {
    setSourceFilter(src);
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchJobs(1, limit, search, sourceFilter, true);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }} className="space-y-6 animate-fade-up">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="apple-badge badge-indigo mb-2">
            <Sparkles size={13} /> Live Global Job Feeds
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            Global Tech Jobs
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Aggregated from RemoteOK, Remotive, Arbeitnow, and The Muse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/40 dark:hover:border-indigo-500/40 transition duration-150 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sync Fresh Jobs
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ───────────────────────────────── */}
      <div className="apple-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-lg">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role, company, skills (e.g. React, Python, Fullstack)..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-indigo-500 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
                fetchJobs(1, limit, '', sourceFilter);
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-gray-300"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
          >
            Search
          </button>
        </form>

        {/* Source Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter size={12} /> Source:
          </div>
          {sources.map((src) => {
            const isActive = sourceFilter.toLowerCase() === src.toLowerCase();
            return (
              <button
                key={src}
                onClick={() => handleSourceChange(src)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition duration-150 ${
                  isActive
                    ? 'bg-amber-500/20 dark:bg-indigo-500/20 text-amber-800 dark:text-indigo-300 border border-amber-500/40 dark:border-indigo-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] bg-[var(--card-flat)] border border-[var(--card-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                {src}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Summary & Pagination Top Bar ──────────────────────── */}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
        <div>
          Showing{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {jobs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </span>{' '}
          -{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
          </span>{' '}
          of <span className="font-semibold text-[var(--text-primary)]">{pagination.totalCount}</span> jobs
        </div>

        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value);
              setLimit(newLimit);
              setPage(1);
            }}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] text-xs rounded-lg px-2 py-1 outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
      </div>

      {/* ── Job Cards List ────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="apple-card p-12 text-center">
          <Briefcase size={32} className="text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">No job openings found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-4">
            Try adjusting your search keywords, clear the source filter, or click &quot;Sync Fresh Jobs&quot; to fetch new listings.
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-amber-600 dark:bg-indigo-600 text-white text-xs font-semibold transition inline-flex items-center gap-2"
          >
            <RefreshCw size={12} /> Sync Global APIs Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, idx) => (
            <div
              key={job._id || `${job.title}-${idx}`}
              className="apple-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Job Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="apple-badge badge-indigo uppercase font-bold tracking-wider text-[10px]">
                    {job.source}
                  </span>
                  {job.type && (
                    <span className="apple-badge badge-dim text-[10px]">{job.type}</span>
                  )}
                  {job.postedAt && (
                    <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(job.postedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] hover:text-amber-700 dark:hover:text-indigo-300 transition line-clamp-1">
                  {job.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                    <Building2 size={12} className="text-amber-600 dark:text-indigo-400" />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                      💰 {job.salary}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {job.tags.slice(0, 5).map((t, ti) => (
                      <span
                        key={ti}
                        className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--card-border)] text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--card-border)]">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition duration-150"
                >
                  Apply <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom Pagination Controls ────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="apple-card p-3.5 flex items-center justify-between gap-2 shadow-md">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage || loading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--card-flat)] border border-[var(--card-border)] hover:border-amber-500/40 dark:hover:border-indigo-500/40 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (pagination.totalPages > 5) {
                if (pagination.page > 3) {
                  pageNum = pagination.page - 2 + i;
                }
                if (pageNum > pagination.totalPages) {
                  pageNum = pagination.totalPages - (4 - i);
                }
              }
              const isCurrent = pageNum === pagination.page;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-amber-600 dark:bg-indigo-600 text-white shadow-md'
                      : 'text-[var(--text-secondary)] bg-[var(--card-flat)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage || loading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] bg-[var(--card-flat)] border border-[var(--card-border)] hover:border-amber-500/40 dark:hover:border-indigo-500/40 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
