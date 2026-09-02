'use client';

import React, { useState } from 'react';
import { uploadExcelFile } from '@/lib/api';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  Layers,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file first.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const res = await uploadExcelFile(file, mode);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.message || 'Failed to upload Excel file.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while uploading.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();

    const dsaLectures = [
      { 'sr #': 1, 'url': 'https://youtube.com/watch?v=sample1', 'title': 'Array Basics & Pointers', 'duration': '1h 15m', 'status': 'Completed' },
      { 'sr #': 2, 'url': 'https://youtube.com/watch?v=sample2', 'title': 'Binary Search Deep Dive', 'duration': '2h 00m', 'status': 'Pending' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dsaLectures), 'dsa lectures');

    const dailyTracker = [
      { 'Date': '2026-08-31', 'DSA Done': 'Yes', 'DSA Topic': 'Arrays & Two Pointers', 'Applications': 5, 'Project Work': 'Yes', 'Project': 'AI Knowledge Copilot', 'AI Learning': 'Yes', 'Notes': 'Solved 3 hard problems' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyTracker), 'Daily Tracker');

    const dsaProgress = [
      { 'Topic': 'Arrays', 'Total': 25, 'Solved': 15, 'Status': 'In Progress' },
      { 'Topic': 'Dynamic Programming', 'Total': 30, 'Solved': 12, 'Status': 'In Progress' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dsaProgress), 'DSA Progress');

    const appTracker = [
      { 'Sr No': 1, 'Date Applied': '2026-08-31', 'Company': 'Google', 'Role': 'Software Engineer', 'Platform': 'Referral', 'Status': 'Applied', 'Follow-up Date': '2026-09-07', 'Notes': 'Referred by alumni' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appTracker), 'Application Tracker');

    XLSX.writeFile(wb, 'Aryan_Daily_Tracker_Master.xlsx');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="apple-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="apple-badge badge-green font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" /> Multi-Sheet Admin Sync Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Admin & Excel Data Hub
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload your master Excel spreadsheet containing sheets <span className="font-mono text-amber-700 dark:text-indigo-400">dsa lectures, Daily Tracker, DSA Progress, Application Tracker</span> to update all tables instantly!
          </p>
        </div>

        <button
          onClick={downloadSampleExcel}
          className="px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-flat)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)] text-xs font-semibold flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" /> Download Sample .xlsx
        </button>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="apple-card p-8 border-dashed border-2 border-[var(--card-border)] text-center flex flex-col items-center justify-center relative cursor-pointer hover:border-amber-500/40 dark:hover:border-indigo-500/40 transition">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-amber-700 dark:text-indigo-400 mb-3 shadow-md">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {file ? file.name : 'Click or Drag & Drop Excel file (.xlsx, .xls, .csv)'}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Supports multi-sheet workbooks with standard table headers'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="apple-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Database Update Strategy</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">Choose how Excel rows are synchronized</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('replace')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                mode === 'replace'
                  ? 'bg-amber-600 dark:bg-indigo-600 text-white shadow-md'
                  : 'bg-[var(--card-flat)] text-[var(--text-secondary)] border border-[var(--card-border)]'
              }`}
            >
              Replace (Clean Sync)
            </button>
            <button
              type="button"
              onClick={() => setMode('append')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                mode === 'append'
                  ? 'bg-amber-600 dark:bg-indigo-600 text-white shadow-md'
                  : 'bg-[var(--card-flat)] text-[var(--text-secondary)] border border-[var(--card-border)]'
              }`}
            >
              Append (Add Only)
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-3.5 rounded-2xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing Database...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" /> Import & Sync All Sections
            </>
          )}
        </button>
      </form>

      {/* Result feedback */}
      {result && (
        <div className="apple-card p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{result.message}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mt-3">
            <div className="apple-card-flat p-2">
              <span className="font-black text-[var(--text-primary)] block">{result.results?.dsaLectures || 0}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Lectures</span>
            </div>
            <div className="apple-card-flat p-2">
              <span className="font-black text-[var(--text-primary)] block">{result.results?.dailyTracker || 0}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Daily Logs</span>
            </div>
            <div className="apple-card-flat p-2">
              <span className="font-black text-[var(--text-primary)] block">{result.results?.dsaProgress || 0}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Topics</span>
            </div>
            <div className="apple-card-flat p-2">
              <span className="font-black text-[var(--text-primary)] block">{result.results?.applicationTracker || 0}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Applications</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="apple-card p-4 border-rose-500/30 bg-rose-500/5 flex items-center gap-2.5 text-rose-500 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
