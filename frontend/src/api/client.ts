import axios, { AxiosHeaders } from 'axios';
import { clearToken, getToken } from '../auth/token';
import type { ApiResponse } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  const resolvedUrl = (() => {
    if (!config.url) {
      return null;
    }

    try {
      return new URL(config.url, config.baseURL ?? apiBaseUrl);
    } catch {
      return null;
    }
  })();

  const isApiRequest = resolvedUrl?.pathname.startsWith('/api/') ?? false;

  if (token && isApiRequest) {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export const unwrapApiResponse = <T>(apiResponse: ApiResponse<T>): T => {
  if (apiResponse.status !== 'success') {
    throw new Error(apiResponse.message ?? 'Request failed');
  }

  return apiResponse.data as T;
};
