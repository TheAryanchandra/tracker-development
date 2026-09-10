'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, Download, FileSpreadsheet, Layers, Loader2, LockKeyhole, Mail, UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { updateAdminCredentials, uploadExcelFile } from '@/lib/api';
import { getAuthUser, saveAuth } from '@/lib/auth';

export default function AdminPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState(() => getAuthUser<{ email?: string }>()?.email || '');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  const selectFile = (candidate?: File) => { if (candidate) { setFile(candidate); setError(null); setResult(null); } };
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Choose a workbook before syncing.');
    try { setUploading(true); setError(null); setResult(null); const res = await uploadExcelFile(file, mode); res.success ? setResult(res) : setError(res.message || 'Sync failed.'); }
    catch (err: any) { setError(err.response?.data?.message || err.message || 'Something went wrong while syncing.'); }
    finally { setUploading(false); }
  };
  const downloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 'sr #': 1, url: 'https://youtube.com/watch?v=sample1', title: 'Array Basics & Pointers', duration: '1h 15m', status: 'Completed' }]), 'dsa lectures');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Date: '2026-08-31', 'DSA Done': 'Yes', 'DSA Topic': 'Arrays & Two Pointers', Applications: 5, 'Project Work': 'Yes', Project: 'AI Knowledge Copilot', Notes: 'Solved 3 hard problems' }]), 'Daily Tracker');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Topic: 'Arrays', Total: 25, Solved: 15, Status: 'In Progress' }]), 'DSA Progress');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 'Sr No': 1, 'Date Applied': '2026-08-31', Company: 'Google', Role: 'Software Engineer', Platform: 'Referral', Status: 'Applied' }]), 'Application Tracker');
    XLSX.writeFile(wb, 'Aryan_Daily_Tracker_Master.xlsx');
  };
  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaving(true); setAccountMessage(null);
    try {
      const res = await updateAdminCredentials(accountEmail, accountPassword);
      saveAuth(res.token, res.user);
      setAccountPassword('');
      setAccountMessage('Admin credentials updated. Your session has been refreshed.');
    } catch (err: any) {
      setAccountMessage(err.response?.data?.message || 'Could not update admin credentials.');
    } finally { setAccountSaving(false); }
  };
  return <div className="admin-page animate-fade-up">
    <header className="admin-header"><div><div className="admin-kicker"><Layers size={14}/> WORKSPACE ADMIN</div><h1>Data hub<span>.</span></h1><p>Keep your tracker, applications, progress, and lectures in sync from one workbook.</p></div><button className="admin-quiet-button" onClick={downloadSampleExcel}><Download size={16}/> <span>Download sample</span></button></header>
    <div className="admin-status"><div className="admin-status-icon"><Database size={18}/></div><div><strong>Sync center</strong><span>Ready for your next workbook</span></div><span className="admin-live"><i/> Local workspace</span></div>
    <section className="admin-card mb-5"><div className="admin-card-head"><div><div className="admin-step">03 <span>ACCOUNT SECURITY</span></div><h2>Admin access</h2><p>Change the email or password used to sign in to this workspace.</p></div><LockKeyhole className="admin-card-mark" size={26}/></div>
      <form onSubmit={handleAccountSave} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
        <label className="block"><span className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">Admin email</span><div className="relative"><Mail size={15} className="absolute left-3 top-3 text-[var(--text-tertiary)]"/><input required type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-amber-600"/></div></label>
        <label className="block"><span className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">New password</span><div className="relative"><LockKeyhole size={15} className="absolute left-3 top-3 text-[var(--text-tertiary)]"/><input required minLength={10} type="password" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} placeholder="At least 10 characters" className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-amber-600"/></div></label>
        <button disabled={accountSaving} className="admin-submit !m-0 !w-auto whitespace-nowrap" type="submit">{accountSaving ? <Loader2 className="spin" size={17}/> : <LockKeyhole size={17}/>} {accountSaving ? 'Saving…' : 'Update access'}</button>
      </form>
      {accountMessage && <p className="mt-3 text-xs font-semibold text-[var(--text-secondary)]">{accountMessage}</p>}
    </section>
    <form onSubmit={handleUpload} className="admin-form">
      <section className="admin-card admin-upload-card"><div className="admin-card-head"><div><div className="admin-step">01 <span>UPLOAD</span></div><h2>Bring in your workbook</h2><p>Drop a file here or browse from your device.</p></div><FileSpreadsheet className="admin-card-mark" size={26}/></div>
        <div className={`admin-dropzone ${file ? 'has-file' : ''}`} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }}>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => selectFile(e.target.files?.[0])} />
          <div className="admin-upload-icon"><UploadCloud size={23}/></div><strong>{file ? file.name : 'Drop your Excel file here'}</strong><span>{file ? `${(file.size / 1024).toFixed(1)} KB · Ready to sync` : 'or click to browse · .xlsx, .xls, .csv'}</span>
        </div>
        <div className="admin-guidance"><strong>Supported sheets</strong><span>dsa lectures</span><span>Daily Tracker</span><span>DSA Progress</span><span>Application Tracker</span></div>
      </section>
      <section className="admin-card admin-options"><div><div className="admin-step">02 <span>SYNC STRATEGY</span></div><h2>How should we update?</h2><p>Choose what happens to existing rows.</p></div><div className="admin-segmented"><button type="button" className={mode === 'replace' ? 'active' : ''} onClick={() => setMode('replace')}><b>Replace</b><small>Clean sync of every sheet</small></button><button type="button" className={mode === 'append' ? 'active' : ''} onClick={() => setMode('append')}><b>Append</b><small>Add new rows only</small></button></div></section>
      <button className="admin-submit" disabled={!file || uploading} type="submit">{uploading ? <><Loader2 className="spin" size={18}/> Reading workbook and syncing…</> : <><Database size={18}/> Import & sync workspace</>}</button>
    </form>
    {result && <section className="admin-feedback success"><CheckCircle2 size={20}/><div><strong>{result.message || 'Workspace synced successfully'}</strong><div className="admin-metrics">{[['dsaLectures','Lectures'],['dailyTracker','Daily logs'],['dsaProgress','Topics'],['applicationTracker','Applications']].map(([key,label]) => <span key={key}><b>{result.results?.[key] || 0}</b>{label}</span>)}</div></div></section>}
    {error && <section className="admin-feedback error"><AlertTriangle size={20}/><span>{error}</span></section>}
  </div>;
}
