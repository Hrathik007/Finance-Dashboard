export type Role = 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_VIEWER';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string | null;
  data: T | null;
}

export interface JwtPayload {
  sub?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
}

export type RecordType = 'INCOME' | 'EXPENSE';

export interface FinancialRecordDTO {
  id?: number;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
}

export interface FinancialRecordResponse extends FinancialRecordDTO {
  id: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface RecordFilterParams {
  start?: string;
  end?: string;
  category?: string;
  type?: RecordType;
  page?: number;
  size?: number;
}

export interface SummaryResponse {
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  net?: number;
  savingsRate?: number;
  recordCount?: number;
  [key: string]: unknown;
}

export interface UserDTO {
  username: string;
  password: string;
  email: string;
  roles: Role[];
  active?: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  roles: Role[];
  active: boolean;
}

export interface BudgetRequest {
  userId: number;
  category: string;
  amount: number;
  period?: string;
}

export type BudgetHealth = 'SAFE' | 'NEAR_LIMIT' | 'EXCEEDED';

export interface BudgetStatus {
  userId?: number;
  category?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  status?: BudgetHealth;
  [key: string]: unknown;
}

export interface AuditEntry {
  id: number;
  username: string;
  action: string;
  timestamp: string;
}
