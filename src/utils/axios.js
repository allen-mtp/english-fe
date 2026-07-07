import axios from 'axios';

function parseNdjsonPayload(data) {
  if (typeof data !== 'string') return data;

  const lines = data.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return data;

  let lastDone = null;
  for (const line of lines) {
    const parsed = JSON.parse(line);
    if (parsed.type === 'error') {
      const err = new Error(parsed.error || 'Request failed');
      err.response = { data: { error: parsed.error || 'Request failed' }, status: 503 };
      throw err;
    }
    if (parsed.type === 'done') {
      const { type, ...payload } = parsed;
      lastDone = payload;
    }
  }

  return lastDone ?? data;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  responseType: 'text',
  transformResponse: [(data, headers) => {
    const contentType = headers?.['content-type'] || '';
    if (contentType.includes('application/x-ndjson')) {
      return parseNdjsonPayload(data);
    }
    if (typeof data === 'string' && data.trim()) {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }],
});

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
let isRefreshing = false;
let refreshPromise = null;
let isRedirecting = false;

function shouldRedirect() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return !path.startsWith('/login') && !path.startsWith('/register');
}

function redirectToLogin() {
  if (typeof window === 'undefined' || isRedirecting) return;
  isRedirecting = true;
  window.location.href = '/login?reason=session_expired';
}

async function doRefresh() {
  const res = await axiosInstance.post('/auth/refresh');
  return res.data;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && error.message) {
      error.response = { data: { error: error.message }, status: 500 };
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const isAuthPath = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !isAuthPath && !originalRequest._retried) {
      originalRequest._retried = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefresh()
          .then((data) => {
            isRefreshing = false;
            return data;
          })
          .catch((err) => {
            isRefreshing = false;
            refreshPromise = null;
            if (shouldRedirect()) redirectToLogin();
            throw err;
          });
      }

      try {
        await refreshPromise;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    if (status === 401 && isAuthPath && url.includes('/auth/refresh')) {
      if (shouldRedirect()) redirectToLogin();
    } else if (status === 401 && shouldRedirect() && originalRequest?._retried) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
