import { apiClient, unwrapApiResponse } from './client';
import type { ApiResponse, AuditEntry } from '../types';

export const getAuditEntries = async (): Promise<AuditEntry[]> => {
  const response = await apiClient.get<ApiResponse<AuditEntry[]>>('/api/audit');
  return unwrapApiResponse(response.data);
};
