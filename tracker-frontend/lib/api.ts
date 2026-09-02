import axios from 'axios';

// Automatically choose production Render URL or environment variable or localhost for dev
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'https://tracker-backend-rnec.onrender.com/api';
  }
  return 'http://127.0.0.1:5000/api';
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to safely unwrap arrays from { success: true, count: N, data: [...] }
const extractArray = (resData: any): any[] => {
  if (Array.isArray(resData)) return resData;
  if (resData && Array.isArray(resData.data)) return resData.data;
  return [];
};

// Dashboard APIs
export const fetchDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/stats');
    return res.data;
  } catch (err) {
    console.warn('Primary API fetch failed, retrying fallback...', err);
    try {
      const fallbackUrl = (typeof window !== 'undefined' && window.location.protocol === 'https:')
        ? 'https://tracker-backend-rnec.onrender.com/api/dashboard/stats'
        : 'http://127.0.0.1:5000/api/dashboard/stats';
      const res = await axios.get(fallbackUrl);
      return res.data;
    } catch (fallbackErr) {
      console.error('All dashboard stat fetches failed:', fallbackErr);
      return { success: false, data: null };
    }
  }
};

// DSA Lectures APIs
export const fetchLectures = async (status?: string, search?: string) => {
  try {
    const res = await api.get('/dsa-lectures', { params: { status, search } });
    return extractArray(res.data);
  } catch (err) {
    return [];
  }
};

export const createLecture = async (data: any) => {
  const res = await api.post('/dsa-lectures', data);
  return res.data;
};

export const updateLecture = async (id: string, data: any) => {
  const res = await api.put(`/dsa-lectures/${id}`, data);
  return res.data;
};

export const deleteLecture = async (id: string) => {
  const res = await api.delete(`/dsa-lectures/${id}`);
  return res.data;
};

// Daily Tracker APIs
export const fetchDailyLogs = async () => {
  try {
    const res = await api.get('/daily-tracker');
    return extractArray(res.data);
  } catch (err) {
    return [];
  }
};

export const createDailyLog = async (data: any) => {
  const res = await api.post('/daily-tracker', data);
  return res.data;
};

export const updateDailyLog = async (id: string, data: any) => {
  const res = await api.put(`/daily-tracker/${id}`, data);
  return res.data;
};

export const deleteDailyLog = async (id: string) => {
  const res = await api.delete(`/daily-tracker/${id}`);
  return res.data;
};

// DSA Progress APIs
export const fetchDsaProgress = async () => {
  try {
    const res = await api.get('/dsa-progress');
    return extractArray(res.data);
  } catch (err) {
    return [];
  }
};

export const createDsaProgress = async (data: any) => {
  const res = await api.post('/dsa-progress', data);
  return res.data;
};

export const updateDsaProgress = async (id: string, data: any) => {
  const res = await api.put(`/dsa-progress/${id}`, data);
  return res.data;
};

export const deleteDsaProgress = async (id: string) => {
  const res = await api.delete(`/dsa-progress/${id}`);
  return res.data;
};

// Application Tracker APIs
export const fetchApplications = async (status?: string, search?: string) => {
  try {
    const res = await api.get('/application-tracker', { params: { status, search } });
    return extractArray(res.data);
  } catch (err) {
    return [];
  }
};

export const createApplication = async (data: any) => {
  const res = await api.post('/application-tracker', data);
  return res.data;
};

export const updateApplication = async (id: string, data: any) => {
  const res = await api.put(`/application-tracker/${id}`, data);
  return res.data;
};

export const deleteApplication = async (id: string) => {
  const res = await api.delete(`/application-tracker/${id}`);
  return res.data;
};

// Excel Upload API
export const uploadExcelFile = async (file: File, mode: 'replace' | 'append' = 'replace') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);

  const res = await api.post('/upload/excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Resume / File Upload API
export const uploadResumeFile = async (file: File, applicationId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (applicationId) formData.append('applicationId', applicationId);

  const res = await api.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// AI Chat RAG API with sessionId support
export const sendAiChat = async (prompt: string, sessionId = 'default') => {
  const res = await api.post('/ai/chat', { prompt, sessionId });
  return res.data;
};

// AI File / Image Upload (OCR + RAG)
export const uploadAiFile = async (file: File, prompt = '', sessionId = 'default') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt);
  formData.append('sessionId', sessionId);

  const res = await api.post('/ai/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Google Sheets Live Sync APIs
export const syncGoogleSheets = async () => {
  const res = await api.post('/sheets/sync');
  return res.data;
};

export const fetchSheetsStatus = async () => {
  try {
    const res = await api.get('/sheets/status');
    return res.data;
  } catch (err) {
    return { success: false, data: null };
  }
};

// SSE stream URL builder — used for EventSource streaming
export const getStreamUrl = (prompt: string, sessionId = 'default') => {
  const base = getBaseUrl();
  return `${base}/ai/stream?prompt=${encodeURIComponent(prompt)}&sessionId=${encodeURIComponent(sessionId)}`;
};
