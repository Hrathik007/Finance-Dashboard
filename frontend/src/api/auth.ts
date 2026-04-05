import { apiClient, unwrapApiResponse } from './client';
import type { ApiResponse, LoginRequest, LoginResponseData } from '../types';

export const login = async (payload: LoginRequest): Promise<string> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/api/auth/login', payload);
  const data = unwrapApiResponse(response.data);

  if (!data?.token) {
    throw new Error('Token missing in login response');
  }

  return data.token;
};
