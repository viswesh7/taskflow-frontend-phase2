import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, ApiError } from '../types';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', timeout: 15000 });
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
let sessionExpired: (() => void) | null = null;
export const tokenStore = {
  set(auth: AuthResponse) { accessToken=auth.accessToken; refreshToken=auth.refreshToken; },
  clear() { accessToken=null; refreshToken=null; },
  getRefresh() { return refreshToken; },
  onExpired(fn:()=>void) { sessionExpired=fn; },
};
api.interceptors.request.use((config) => { if (accessToken) config.headers.Authorization=`Bearer ${accessToken}`; return config; });
interface RetryConfig extends InternalAxiosRequestConfig { _retried?: boolean }
api.interceptors.response.use(r=>r, async (error: AxiosError<ApiError>) => {
  const original=error.config as RetryConfig | undefined;
  const path=original?.url || '';
  if (error.response?.status!==401 || !original || original._retried || /\/auth\/(login|register|refresh|logout)/.test(path) || !refreshToken) return Promise.reject(error);
  original._retried=true;
  try {
    if (!refreshPromise) {
      const currentRefresh=refreshToken;
      refreshPromise=axios.post<AuthResponse>(`${api.defaults.baseURL}/auth/refresh`, {refreshToken:currentRefresh}, {timeout:15000})
        .then(({data})=>{tokenStore.set(data);return data.accessToken;})
        .finally(()=>{refreshPromise=null;});
    }
    const token=await refreshPromise;
    original.headers.Authorization=`Bearer ${token}`;
    return api(original);
  } catch (refreshError) { tokenStore.clear(); sessionExpired?.(); return Promise.reject(refreshError); }
});
export function errorMessage(error:unknown):string {
  if (axios.isAxiosError<ApiError>(error)) return error.response?.data?.message || (error.code==='ERR_NETWORK'?'Cannot reach the backend. Check Spring Boot and CORS.':error.message);
  return error instanceof Error ? error.message : 'Something went wrong';
}
