import { apiClient, unwrapApiResponse } from './client';
import type { ApiResponse, BudgetRequest, BudgetStatus } from '../types';

export const createBudget = async (payload: BudgetRequest): Promise<BudgetStatus> => {
  const response = await apiClient.post<ApiResponse<BudgetStatus>>('/api/budget', payload);
  return unwrapApiResponse(response.data);
};

export const getBudgetStatus = async (userId: number): Promise<BudgetStatus | BudgetStatus[]> => {
  const response = await apiClient.get<ApiResponse<BudgetStatus | BudgetStatus[]>>('/api/budget/status', {
    params: { userId },
  });
  return unwrapApiResponse(response.data);
};
