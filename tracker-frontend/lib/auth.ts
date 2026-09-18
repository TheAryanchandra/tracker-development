export const AUTH_TOKEN_KEY = 'tracker_access_token';
export const AUTH_USER_KEY = 'tracker_auth_user';

export const getAuthToken = () => typeof window === 'undefined' ? null : localStorage.getItem(AUTH_TOKEN_KEY);

export const saveAuth = (token: string, user: unknown) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('tracker-auth-changed'));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event('tracker-auth-changed'));
};

export const getAuthUser = <T = { name?: string; email?: string }>(): T | null => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null'); } catch { return null; }
};