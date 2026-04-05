import { apiClient, unwrapApiResponse } from './client';
import type { ApiResponse, UserDTO, UserResponse } from '../types';

export const createUser = async (payload: UserDTO): Promise<UserResponse> => {
  const response = await apiClient.post<ApiResponse<UserResponse>>('/api/users', payload);
  return unwrapApiResponse(response.data);
};

export const listUsers = async (): Promise<UserResponse[]> => {
  const response = await apiClient.get<ApiResponse<UserResponse[]>>('/api/users');
  return unwrapApiResponse(response.data);
};

export const updateUserStatus = async (id: number, active: boolean): Promise<UserResponse> => {
  const response = await apiClient.put<ApiResponse<UserResponse>>(`/api/users/${id}/status`, null, {
    params: { active },
  });
  return unwrapApiResponse(response.data);
};
