'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe2,
  Layers,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  Power,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Smartphone,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  uploadExcelFile,
  fetchIotDevices,
  controlIotDevice,
  createIotDevice,
  deleteIotDevice,
  fetchPortfolio,
  updatePortfolio,
  fetchContactMessages,
  deleteContactMessage,
  sendAiChat,
} from '@/lib/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'portfolio' | 'chatbot' | 'iot' | 'excel'>('requests');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState('');

  // ── Recruiter Inquiries & Contact Requests ──
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // ── Excel Sync State ──
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [excelError, setExcelError] = useState<string | null>(null);

  // ── IoT State ──
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [loadingIot, setLoadingIot] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCategory, setNewDeviceCategory] = useState('switch');
  const [newDeviceLocation, setNewDeviceLocation] = useState('Studio');

  // ── Portfolio State ──
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState<string | null>(null);

  // ── Chatbot Playground State ──
  const [testPrompt, setTestPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState<any>(null);

  useEffect(() => {
    // Check if session token exists
    if (typeof window !== 'undefined' && sessionStorage.getItem('jarvis_admin_auth') === 'granted') {
      setIsAuthenticated(true);
    }
    loadIotData();
    loadPortfolioData();
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoadingContacts(true);
    const res = await fetchContactMessages();
    if (res.success && res.contacts) {
      setContacts(res.contacts);
    }
    setLoadingContacts(false);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    await deleteContactMessage(id);
    loadContacts();
  };

  const loadIotData = async () => {
    setLoadingIot(true);
    const res = await fetchIotDevices();
    if (res.success && res.devices) {
      setIotDevices(res.devices);
    }
    setLoadingIot(false);
  };

  const loadPortfolioData = async () => {
    const res = await fetchPortfolio();
    if (res.success && res.portfolio) {
      setPortfolioData(res.portfolio);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'admin123' || adminPass === 'aryan123' || adminPass === 'aryan2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('jarvis_admin_auth', 'granted');
      setPassError('');
    } else {
      setPassError('Invalid admin password. Try "admin123" or "aryan123"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jarvis_admin_auth');
    setAdminPass('');
  };


  // Excel handlers
  const selectFile = (candidate?: File) => {
    if (candidate) {
      setFile(candidate);
      setExcelError(null);
      setResult(null);
    }
  };

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setExcelError('Choose a workbook before syncing.');
    try {
      setUploading(true);
      setExcelError(null);
      setResult(null);
      const res = await uploadExcelFile(file, mode);
      res.success ? setResult(res) : setExcelError(res.message || 'Sync failed.');
    } catch (err: any) {
      setExcelError(err.response?.data?.message || err.message || 'Error uploading.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 'sr #': 1, url: 'https://youtube.com/watch?v=sample1', title: 'Array Basics', duration: '1h 15m', status: 'Completed' }]), 'dsa lectures');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Date: '2026-09-18', 'DSA Done': 'Yes', 'DSA Topic': 'Arrays & Two Pointers', Applications: 5, 'Project Work': 'Yes', Notes: 'Solved 3 hard problems' }]), 'Daily Tracker');
    XLSX.writeFile(wb, 'Aryan_Daily_Tracker_Master.xlsx');
  };

  // IoT handlers
  const toggleDeviceState = async (deviceId: string, currentOn: boolean) => {
    await controlIotDevice({ deviceId, isOn: !currentOn });
    loadIotData();
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName) return;
    await createIotDevice({ name: newDeviceName, category: newDeviceCategory, location: newDeviceLocation });
    setNewDeviceName('');
    loadIotData();
  };

  const handleDeleteDevice = async (id: string) => {
    await deleteIotDevice(id);
    loadIotData();
  };

  // Portfolio handlers
  const handlePortfolioSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioData) return;
    setSavingPortfolio(true);
    setPortfolioMessage(null);
    const res = await updatePortfolio(portfolioData);
    if (res.success) {
      setPortfolioMessage('Portfolio updated successfully! Changes are live on your portfolio page.');
    } else {
      setPortfolioMessage('Failed to update portfolio: ' + (res.message || 'Error'));
    }
    setSavingPortfolio(false);
  };

  // Chatbot Playground handler
  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt) return;
    setChatLoading(true);
    setChatResponse(null);
    try {
      const res = await sendAiChat(testPrompt, 'admin_test_session');
      setChatResponse(res);
    } catch (err: any) {
      setChatResponse({ error: err.message || 'Chat test failed' });
    } finally {
      setChatLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Enter passcode to manage Jarvis AI, IoT devices, & Portfolio</p>
          </div>
          <div>
            <input
              type="password"
              placeholder="Admin password (default: admin123)"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
            />
            {passError && <p className="mt-2 text-xs text-rose-400">{passError}</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition text-white">
            Unlock Admin Console
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 animate-fade-up">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1">
            <Layers size={14} /> JARVIS CENTRAL COMMAND
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin & Orchestration Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage Jarvis multi-tool agent, IoT ambient devices, Excel sync, and live portfolio.</p>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'requests' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <MessageSquare size={16} /> Recruiter Inquiries
              {contacts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  {contacts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Globe2 size={16} /> Portfolio Manager
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'chatbot' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Bot size={16} /> Chatbot & Agent
            </button>
            <button
              onClick={() => setActiveTab('iot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'iot' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Cpu size={16} /> IoT Hub
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'excel' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FileSpreadsheet size={16} /> Excel Sync
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition cursor-pointer"
            title="Lock Admin Console"
          >
            <Lock size={14} /> Lock Console
          </button>
        </div>
      </header>

      {/* TAB 0: Recruiter Inquiries & Contact Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                <MessageSquare size={14} /> Lead Pipeline & Whisperflow Inquiries
              </div>
              <h2 className="text-xl font-bold text-white">Recruiter Inquiries & Messages</h2>
              <p className="text-xs text-slate-400 mt-1">
                All inquiries submitted through your portfolio contact form or dispatched via Whisperflow.
              </p>
            </div>
            <button
              onClick={loadContacts}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <RefreshCw size={14} className={loadingContacts ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loadingContacts ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="animate-spin mx-auto mb-2 text-amber-500" size={24} /> Loading recruiter messages...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
              <Mail className="mx-auto text-slate-600 mb-3" size={36} />
              <h3 className="text-base font-semibold text-slate-300">No Recruiter Inquiries Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When recruiters, HRs, or CTOs submit messages on your portfolio, they will appear here and trigger alerts to aryanchandra3456@gmail.com.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((c: any) => (
                <div
                  key={c._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-base text-white">{c.name}</div>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail size={12} /> {c.email}
                      </a>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {c.message}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <a
                      href={`mailto:${c.email}?subject=Re: Interview / Collaboration with Aryan Chandra`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg text-xs font-semibold transition"
                    >
                      <Send size={12} /> Reply Directly
                    </a>
                    <button
                      onClick={() => handleDeleteContact(c._id)}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Chatbot & Agent Command Center */}
      {activeTab === 'chatbot' && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Jarvis Agent Test Playground</h2>
                    <p className="text-xs text-slate-400">Test multi-tool reasoning, Playwright scraping, IoT commands, and state execution.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full font-semibold">
                  LangGraph Active
                </span>
              </div>

              <form onSubmit={handleTestChat} className="space-y-4">
                <div>
                  <textarea
                    rows={3}
                    placeholder='Try: "Turn on the studio light", "Search latest React 19 docs", "Check my DSA streak", or "Log 3 applications sent to Google today"'
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={chatLoading || !testPrompt}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition"
                  >
                    {chatLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Execute Prompt Trace
                  </button>
                </div>
              </form>

              {chatResponse && (
                <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span>Source: {chatResponse.source || 'Jarvis State Graph'}</span>
                    <span>Tools Executed: {chatResponse.toolsUsed?.length || 0}</span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{chatResponse.reply || chatResponse.response || JSON.stringify(chatResponse, null, 2)}</p>
                  {chatResponse.toolsUsed?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tool Audit Trace:</span>
                      {chatResponse.toolsUsed.map((t: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-slate-300">
                          <b className="text-indigo-400">{t.tool}</b>: {JSON.stringify(t.args)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Model Gateway & System Capabilities */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Settings2 className="text-indigo-400" size={20} />
                <h2 className="text-lg font-bold">Model Gateway</h2>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span>Google Gemini (Primary)</span>
                  <span className="text-emerald-400 font-semibold">Active (Free Tier)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span>Playwright Browser Engine</span>
                  <span className="text-emerald-400 font-semibold">Ready (Headless)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span>MongoDB Atlas Vector Search</span>
                  <span className="text-indigo-400 font-semibold">Hybrid TF-IDF</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span>Context Manager Buffer</span>
                  <span className="text-emerald-400 font-semibold">8192 Tokens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IoT Control Center */}
      {activeTab === 'iot' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="text-indigo-400" size={22} /> Connected IoT Ambient Devices
              </h2>
              <p className="text-xs text-slate-400 mt-1">Control smart workspace relays, climate sensors, and lighting bound to Jarvis AI.</p>
            </div>
            <button onClick={loadIotData} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition">
              <RefreshCw size={14} /> Refresh Devices
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {iotDevices.map((dev) => (
              <div key={dev._id || dev.deviceId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">{dev.category}</span>
                    <button onClick={() => toggleDeviceState(dev.deviceId, dev.state?.isOn)} className={`p-2 rounded-full transition ${dev.state?.isOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      <Power size={18} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">{dev.name}</h3>
                  <p className="text-xs text-slate-400">{dev.location}</p>
                  <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={dev.state?.isOn ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{dev.state?.statusText || (dev.state?.isOn ? 'ON' : 'OFF')}</span>
                    </div>
                    {dev.telemetry?.temperature && (
                      <div className="flex justify-between text-slate-300">
                        <span>Temp / Humidity:</span>
                        <span>{dev.telemetry.temperature}°C / {dev.telemetry.humidity}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={() => handleDeleteDevice(dev._id)} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Device Form */}
          <form onSubmit={handleAddDevice} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Plus size={16} /> Register New IoT Device
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Device Name (e.g., Studio Spotlight)"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newDeviceCategory}
                onChange={(e) => setNewDeviceCategory(e.target.value)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="switch">Switch / Relay</option>
                <option value="light">Smart Lighting</option>
                <option value="thermostat">Thermostat / Climate</option>
                <option value="sensor">Sensor</option>
              </select>
              <input
                type="text"
                placeholder="Location (e.g., Studio Shelf)"
                value={newDeviceLocation}
                onChange={(e) => setNewDeviceLocation(e.target.value)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-medium text-sm rounded-xl text-white transition">
              Add Device to Jarvis
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Portfolio Manager */}
      {activeTab === 'portfolio' && (
        <form onSubmit={handlePortfolioSave} className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe2 className="text-indigo-400" size={22} /> Portfolio Content & Details Manager
              </h2>
              <p className="text-xs text-slate-400 mt-1">Edit bio, projects, mobile applications, and tech skills live on your portfolio.</p>
            </div>
            <button
              type="submit"
              disabled={savingPortfolio}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              {savingPortfolio ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Portfolio Changes
            </button>
          </div>

          {portfolioMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} /> {portfolioMessage}
            </div>
          )}

          {portfolioData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info & Hero */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-indigo-400 border-b border-slate-800 pb-3">Personal & Hero Bio</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={portfolioData.personalInfo?.fullName || ''}
                      onChange={(e) => setPortfolioData({ ...portfolioData, personalInfo: { ...portfolioData.personalInfo, fullName: e.target.value } })}
                      className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Title / Subheading</label>
                    <input
                      type="text"
                      value={portfolioData.personalInfo?.title || ''}
                      onChange={(e) => setPortfolioData({ ...portfolioData, personalInfo: { ...portfolioData.personalInfo, title: e.target.value } })}
                      className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Hero Tagline</label>
                    <input
                      type="text"
                      value={portfolioData.personalInfo?.tagline || ''}
                      onChange={(e) => setPortfolioData({ ...portfolioData, personalInfo: { ...portfolioData.personalInfo, tagline: e.target.value } })}
                      className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Detailed Bio</label>
                    <textarea
                      rows={3}
                      value={portfolioData.personalInfo?.bio || ''}
                      onChange={(e) => setPortfolioData({ ...portfolioData, personalInfo: { ...portfolioData.personalInfo, bio: e.target.value } })}
                      className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-amber-400">Resume Link (Google Drive / Cloud PDF)</label>
                      {portfolioData.personalInfo?.resumeUrl && (
                        <a
                          href={portfolioData.personalInfo.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          Test Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      value={portfolioData.personalInfo?.resumeUrl || ''}
                      onChange={(e) => setPortfolioData({
                        ...portfolioData,
                        personalInfo: {
                          ...portfolioData.personalInfo,
                          resumeUrl: e.target.value,
                        },
                      })}
                      className="w-full mt-1 p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Updating this link will immediately update every Resume button on your public portfolio.
                    </p>
                  </div>
                </div>
              </div>


              {/* Mobile Apps Store Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Smartphone size={18} /> Production Mobile Apps (Fonofy, Delhi Golf Federation, Carenzy)
                </h3>
                <div className="space-y-4 text-xs">
                  {portfolioData.mobileApps?.map((app: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-white text-sm">{app.name} ({app.platform})</div>
                      <div className="text-slate-400">{app.tagline}</div>
                      <div className="text-indigo-400">{app.downloads} • {app.rating}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      {/* TAB 4: Excel Sync */}
      {activeTab === 'excel' && (
        <div className="admin-page animate-fade-up max-w-4xl mx-auto">
          <header className="admin-header">
            <div>
              <div className="admin-kicker"><Layers size={14} /> WORKSPACE ADMIN</div>
              <h1>Data hub<span>.</span></h1>
              <p>Keep your tracker, applications, progress, and lectures in sync from one workbook.</p>
            </div>
            <button className="admin-quiet-button" onClick={downloadSampleExcel}>
              <Download size={16} /> <span>Download sample</span>
            </button>
          </header>

          <form onSubmit={handleExcelUpload} className="admin-form">
            <section className="admin-card admin-upload-card">
              <div className="admin-card-head">
                <div>
                  <div className="admin-step">01 <span>UPLOAD</span></div>
                  <h2>Bring in your workbook</h2>
                  <p>Drop a file here or browse from your device.</p>
                </div>
                <FileSpreadsheet className="admin-card-mark" size={26} />
              </div>
              <div
                className={`admin-dropzone ${file ? 'has-file' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => selectFile(e.target.files?.[0])} />
                <div className="admin-upload-icon"><UploadCloud size={23} /></div>
                <strong>{file ? file.name : 'Drop your Excel file here'}</strong>
                <span>{file ? `${(file.size / 1024).toFixed(1)} KB · Ready to sync` : 'or click to browse · .xlsx, .xls, .csv'}</span>
              </div>
              <div className="admin-guidance">
                <strong>Supported sheets</strong>
                <span>dsa lectures</span>
                <span>Daily Tracker</span>
                <span>DSA Progress</span>
                <span>Application Tracker</span>
              </div>
            </section>

            <section className="admin-card admin-options">
              <div>
                <div className="admin-step">02 <span>SYNC STRATEGY</span></div>
                <h2>How should we update?</h2>
                <p>Choose what happens to existing rows.</p>
              </div>
              <div className="admin-segmented">
                <button type="button" className={mode === 'replace' ? 'active' : ''} onClick={() => setMode('replace')}>
                  <b>Replace</b><small>Clean sync of every sheet</small>
                </button>
                <button type="button" className={mode === 'append' ? 'active' : ''} onClick={() => setMode('append')}>
                  <b>Append</b><small>Add new rows only</small>
                </button>
              </div>
            </section>

            <button className="admin-submit" disabled={!file || uploading} type="submit">
              {uploading ? <><Loader2 className="spin" size={18} /> Reading workbook and syncing…</> : <><Database size={18} /> Import & sync workspace</>}
            </button>
          </form>

          {result && (
            <section className="admin-feedback success">
              <CheckCircle2 size={20} />
              <div>
                <strong>{result.message || 'Workspace synced successfully'}</strong>
                <div className="admin-metrics">
                  {[['dsaLectures', 'Lectures'], ['dailyTracker', 'Daily logs'], ['dsaProgress', 'Topics'], ['applicationTracker', 'Applications']].map(([key, label]) => (
                    <span key={key}><b>{result.results?.[key] || 0}</b>{label}</span>
                  ))}
                </div>
              </div>
            </section>
          )}
          {excelError && (
            <section className="admin-feedback error">
              <AlertTriangle size={20} />
              <span>{excelError}</span>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
