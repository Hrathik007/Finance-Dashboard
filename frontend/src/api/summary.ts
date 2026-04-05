import { apiClient, unwrapApiResponse } from './client';
import type { ApiResponse, SummaryResponse } from '../types';

export const getSummary = async (): Promise<SummaryResponse> => {
  const response = await apiClient.get<ApiResponse<SummaryResponse>>('/api/summary');
  return unwrapApiResponse(response.data);
};
