'use client';

import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { uploadExcelFile } from '../lib/api';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'replace' | 'append'>('replace');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; details?: any } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await uploadExcelFile(file, uploadMode);
      if (res.success) {
        setMessage({
          type: 'success',
          text: res.message || 'Excel sheet uploaded and synchronized successfully!',
          details: res.results,
        });
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to process Excel file' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Error uploading file' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up">
      <div className="apple-card w-full max-w-lg p-6 relative border border-[var(--card-border)] bg-[var(--modal-bg)] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-amber-700 dark:text-indigo-400">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Sync Master Excel File</h2>
            <p className="text-xs text-[var(--text-secondary)]">Supports multi-sheet workbooks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
              file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-[var(--card-border)] hover:border-amber-500/50 bg-[var(--card-flat)]'
            }`}
            onClick={() => document.getElementById('excel-file-input')?.click()}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-7 h-7 mx-auto mb-2 text-[var(--text-tertiary)]" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              {file ? file.name : 'Click to select Excel file (.xlsx, .xls)'}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              Auto-syncs Lectures, Daily Logs, DSA Progress, and Applications
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-flat)] border border-[var(--card-border)]">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Sync Strategy</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode('replace')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  uploadMode === 'replace'
                    ? 'bg-amber-600 dark:bg-indigo-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
                }`}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('append')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  uploadMode === 'append'
                    ? 'bg-amber-600 dark:bg-indigo-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
                }`}
              >
                Append
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <div>
                <p className="font-semibold">{message.text}</p>
                {message.details && (
                  <p className="text-[10px] mt-0.5 opacity-80">
                    Lectures: {message.details.dsaLectures} | Daily Logs: {message.details.dailyTracker} | Topics: {message.details.dsaProgress} | Apps: {message.details.applicationTracker}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-5 py-2 rounded-xl bg-amber-600 dark:bg-indigo-600 hover:bg-amber-500 dark:hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              {loading && <RefreshCw size={13} className="animate-spin" />}
              {loading ? 'Processing...' : 'Upload & Synchronize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
