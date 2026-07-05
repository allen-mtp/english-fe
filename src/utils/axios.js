import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
