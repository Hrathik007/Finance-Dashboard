import { apiClient, unwrapApiResponse } from './client';
import type {
  ApiResponse,
  FinancialRecordDTO,
  FinancialRecordResponse,
  PaginatedResponse,
  RecordFilterParams,
} from '../types';

export const getRecords = async (page = 0, size = 10): Promise<PaginatedResponse<FinancialRecordResponse>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<FinancialRecordResponse>>>('/api/records', {
    params: { page, size },
  });
  return unwrapApiResponse(response.data);
};

export const filterRecords = async (
  filters: RecordFilterParams,
): Promise<PaginatedResponse<FinancialRecordResponse>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<FinancialRecordResponse>>>(
    '/api/records/filter',
    {
      params: {
        start: filters.start,
        end: filters.end,
        category: filters.category,
        type: filters.type,
        page: filters.page ?? 0,
        size: filters.size ?? 10,
      },
    },
  );

  return unwrapApiResponse(response.data);
};

export const createRecord = async (payload: FinancialRecordDTO): Promise<FinancialRecordResponse> => {
  const response = await apiClient.post<ApiResponse<FinancialRecordResponse>>('/api/records', payload);
  return unwrapApiResponse(response.data);
};

export const updateRecord = async (payload: FinancialRecordDTO): Promise<FinancialRecordResponse> => {
  const response = await apiClient.put<ApiResponse<FinancialRecordResponse>>('/api/records', payload);
  return unwrapApiResponse(response.data);
};

export const deleteRecord = async (id: number): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/api/records/${id}`);
  unwrapApiResponse(response.data);
};
