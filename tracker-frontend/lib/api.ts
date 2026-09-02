import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

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
    const res = await axios.get('http://127.0.0.1:5000/api/dashboard/stats');
    return res.data;
  }
};

// DSA Lectures APIs
export const fetchLectures = async (status?: string, search?: string) => {
  try {
    const res = await api.get('/dsa-lectures', { params: { status, search } });
    return extractArray(res.data);
  } catch (err) {
    const res = await axios.get('http://127.0.0.1:5000/api/dsa-lectures', { params: { status, search } });
    return extractArray(res.data);
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
    const res = await axios.get('http://127.0.0.1:5000/api/daily-tracker');
    return extractArray(res.data);
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
    const res = await axios.get('http://127.0.0.1:5000/api/dsa-progress');
    return extractArray(res.data);
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
    const res = await axios.get('http://127.0.0.1:5000/api/application-tracker', { params: { status, search } });
    return extractArray(res.data);
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

  try {
    const res = await api.post('/upload/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    const res = await axios.post('http://127.0.0.1:5000/api/upload/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
};

// Resume / File Upload API
export const uploadResumeFile = async (file: File, applicationId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (applicationId) formData.append('applicationId', applicationId);

  try {
    const res = await api.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    const res = await axios.post('http://127.0.0.1:5000/api/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
};

// AI Chat RAG API with sessionId support
export const sendAiChat = async (prompt: string, sessionId = 'default') => {
  try {
    const res = await api.post('/ai/chat', { prompt, sessionId });
    return res.data;
  } catch (err) {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/ai/chat', { prompt, sessionId });
      return res.data;
    } catch (fallbackErr) {
      throw err;
    }
  }
};

// SSE stream URL builder — used for EventSource streaming
export const getStreamUrl = (prompt: string, sessionId = 'default') => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
  return `${base}/ai/stream?prompt=${encodeURIComponent(prompt)}&sessionId=${encodeURIComponent(sessionId)}`;
};

