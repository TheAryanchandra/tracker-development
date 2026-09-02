'use client';

import { useState } from 'react';
import { uploadExcelFile } from '@/lib/api';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  Layers,
  Sparkles,
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

  // Generate a multi-sheet Sample Excel file directly in browser
  const downloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. dsa lectures sheet
    const dsaLecturesData = [
      { '#': 1, URL: 'https://www.youtube.com/watch?v=m3fg2PRY1u4', Title: 'DSA In Java | Basics | Variables, Operators', Duration: '4h 18m 1s', status: 'Completed' },
      { '#': 2, URL: 'https://www.youtube.com/watch?v=D96vIVeRqHk', Title: 'DSA In Java | If Else | Conditionals', Duration: '2h 43m 11s', status: 'Completed' },
      { '#': 3, URL: 'https://www.youtube.com/watch?v=h0S6HUpyWQE', Title: 'DSA In Java | Loops | For & While', Duration: '3h 46m 25s', status: 'In Progress' },
      { '#': 4, URL: 'https://www.youtube.com/watch?v=mI5hopd2Ycw', Title: 'DSA In Java | Pattern Printing', Duration: '3h 50m 51s', status: 'Pending' },
    ];
    const wsLectures = XLSX.utils.json_to_sheet(dsaLecturesData);
    XLSX.utils.book_append_sheet(wb, wsLectures, 'dsa lectures');

    // 2. Daily Tracker sheet
    const dailyTrackerData = [
      { Date: '01-Sep-2026 (Tue)', 'DSA Done (Y/N)': 'Y', 'DSA Topic / Focus': 'Raghav Garg - Arrays intro', 'Applications Sent': 0, 'Project Work (Y/N)': 'Y', Project: 'AI Copilot - auth service', 'AI Learning (Y/N)': 'Y', Notes: 'Watched 1 lecture + solved 3 problems' },
      { Date: '02-Sep-2026 (Wed)', 'DSA Done (Y/N)': 'Y', 'DSA Topic / Focus': 'Binary Search Basics', 'Applications Sent': 2, 'Project Work (Y/N)': 'Y', Project: 'Tracker Backend APIs', 'AI Learning (Y/N)': 'Y', Notes: 'Added Express APIs + Mongoose schemas' },
    ];
    const wsDaily = XLSX.utils.json_to_sheet(dailyTrackerData);
    XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Tracker');

    // 3. DSA Progress sheet
    const dsaProgressData = [
      { Topic: 'Basics (Time/Space Complexity, Math)', 'Total Problems (enter from your sheet)': 25, 'Problems Solved': 20, '% Complete': '80%', Status: 'In Progress' },
      { Topic: 'Sorting Algorithms', 'Total Problems (enter from your sheet)': 15, 'Problems Solved': 15, '% Complete': '100%', Status: 'Completed' },
      { Topic: 'Arrays', 'Total Problems (enter from your sheet)': 40, 'Problems Solved': 30, '% Complete': '75%', Status: 'In Progress' },
      { Topic: 'Binary Search', 'Total Problems (enter from your sheet)': 30, 'Problems Solved': 18, '% Complete': '60%', Status: 'In Progress' },
      { Topic: 'Strings', 'Total Problems (enter from your sheet)': 25, 'Problems Solved': 12, '% Complete': '48%', Status: 'In Progress' },
      { Topic: 'Linked List', 'Total Problems (enter from your sheet)': 20, 'Problems Solved': 8, '% Complete': '40%', Status: 'In Progress' },
    ];
    const wsProgress = XLSX.utils.json_to_sheet(dsaProgressData);
    XLSX.utils.book_append_sheet(wb, wsProgress, 'DSA Progress');

    // 4. Application Tracker sheet
    const applicationTrackerData = [
      { '#': 1, 'Date Applied': '29-Aug-2026', Company: 'Example Corp', Role: 'Full Stack Engineer', Platform: 'LinkedIn', Status: 'Applied', 'Follow-up Date': '05-Sep-2026', Notes: 'Applied via job post, referral pending' },
      { '#': 2, 'Date Applied': '01-Sep-2026', Company: 'TechInnovate', Role: 'Backend Developer', Platform: 'Company Site', Status: 'Interviewing', 'Follow-up Date': '08-Sep-2026', Notes: 'Scheduled tech round 1' },
    ];
    const wsApps = XLSX.utils.json_to_sheet(applicationTrackerData);
    XLSX.utils.book_append_sheet(wb, wsApps, 'Application Tracker');

    // Save File
    XLSX.writeFile(wb, 'DAILY_TRACKER_MASTER_TEMPLATE.xlsx');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>Multi-Sheet Admin Sync Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Admin & Excel Data Import Hub
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xl">
              Upload your master Excel spreadsheet containing sheets <code className="text-indigo-400 font-mono">dsa lectures</code>, <code className="text-indigo-400 font-mono">Daily Tracker</code>, <code className="text-indigo-400 font-mono">DSA Progress</code>, and <code className="text-indigo-400 font-mono">Application Tracker</code> to update all 4 sections instantly!
            </p>
          </div>

          <button
            onClick={downloadSampleExcel}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition border border-slate-700 whitespace-nowrap shadow-lg"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download Sample Excel Template
          </button>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center transition bg-slate-900/40 relative cursor-pointer">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {file ? file.name : 'Click or Drag & Drop your Excel file (.xlsx)'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports multi-sheet workbooks with standard section tab names'}
                </p>
              </div>
            </div>
          </div>

          {/* Sync Mode Options */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Database Update Strategy</p>
              <p className="text-[11px] text-slate-400">Choose how Excel rows are merged with MongoDB Atlas</p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setMode('replace')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === 'replace' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Wipe & Replace
              </button>
              <button
                type="button"
                onClick={() => setMode('append')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  mode === 'append' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upsert / Merge
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
              !file || uploading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {uploading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Processing & Syncing Excel Sheets...
              </>
            ) : (
              <>
                <Layers className="w-5 h-5" /> Import & Sync Across All 4 Sections
              </>
            )}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Summary */}
        {result && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{result.message}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">DSA Lectures</p>
                <p className="text-base font-extrabold text-indigo-400">{result.results.dsaLectures} Rows</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">Daily Tracker</p>
                <p className="text-base font-extrabold text-emerald-400">{result.results.dailyTracker} Rows</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">DSA Progress</p>
                <p className="text-base font-extrabold text-amber-400">{result.results.dsaProgress} Topics</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">Applications</p>
                <p className="text-base font-extrabold text-violet-400">{result.results.applicationTracker} Jobs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
