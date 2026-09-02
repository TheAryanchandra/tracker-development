import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard APIs
export const fetchDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

// DSA Lectures APIs
export const fetchLectures = async (status?: string, search?: string) => {
  const res = await api.get('/dsa-lectures', { params: { status, search } });
  return res.data;
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
  const res = await api.get('/daily-tracker');
  return res.data;
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
  const res = await api.get('/dsa-progress');
  return res.data;
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
  const res = await api.get('/application-tracker', { params: { status, search } });
  return res.data;
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

  const res = await axios.post(`${API_BASE_URL}/upload/excel`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
