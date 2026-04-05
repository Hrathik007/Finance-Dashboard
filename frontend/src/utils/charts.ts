import type { FinancialRecordResponse } from '../types';

export interface MonthlyChartPoint {
  label: string;
  income: number;
  expense: number;
}

export const formatMonthLabel = (month: string): string => {
  const [year, monthPart] = month.split('-');
  const monthIndex = Number(monthPart) - 1;
  const parsedYear = Number(year);

  if (Number.isNaN(monthIndex) || Number.isNaN(parsedYear)) {
    return month;
  }

  const date = new Date(parsedYear, monthIndex, 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

export const buildMonthlySeries = (records: FinancialRecordResponse[]): MonthlyChartPoint[] => {
  const map = new Map<string, MonthlyChartPoint>();

  records.forEach((record) => {
    const month = record.date.slice(0, 7);
    const existing = map.get(month) ?? { label: month, income: 0, expense: 0 };

    if (record.type === 'INCOME') {
      existing.income += record.amount;
    } else {
      existing.expense += record.amount;
    }

    map.set(month, existing);
  });

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
};
