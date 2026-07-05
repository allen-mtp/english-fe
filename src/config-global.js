export const CONFIG = {
  appName: 'English AI',
  serverUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
};

export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
};