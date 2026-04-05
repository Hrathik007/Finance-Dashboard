import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getRecords } from '../api/records';
import { getSummary } from '../api/summary';
import { hasRole } from '../auth/token';
import SummaryWidgets from '../components/SummaryWidgets';
import { useAppSnackbar } from '../components/useAppSnackbar';
import { buildMonthlySeries, formatMonthLabel } from '../utils/charts';
import { formatDate } from '../utils/date';
import type { FinancialRecordResponse, SummaryResponse } from '../types';

const DashboardPage = () => {
  const isAdmin = hasRole('ROLE_ADMIN');
  const isAnalyst = hasRole('ROLE_ANALYST');
  const isViewer = hasRole('ROLE_VIEWER');
  const { showMessage } = useAppSnackbar();

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [recentRecords, setRecentRecords] = useState<FinancialRecordResponse[]>([]);
  const [chartRecords, setChartRecords] = useState<FinancialRecordResponse[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin || isAnalyst) {
          const summaryData = await getSummary();
          setSummary(summaryData);

          const recentData = await getRecords(0, 5);
          setRecentRecords(recentData.content);

          const chartData = await getRecords(0, 200);
          setChartRecords(chartData.content);
          return;
        }

        if (isViewer) {
          const viewerRecords = await getRecords(0, 20);
          const totals = viewerRecords.content.reduce(
            (acc, item) => {
              if (item.type === 'INCOME') {
                acc.income += item.amount;
              } else {
                acc.expense += item.amount;
              }
              return acc;
            },
            { income: 0, expense: 0 },
          );

          setSummary({
            totalIncome: totals.income,
            totalExpense: totals.expense,
            balance: totals.income - totals.expense,
            recordCount: viewerRecords.totalElements,
          });
          setRecentRecords(viewerRecords.content.slice(0, 5));
          setChartRecords(viewerRecords.content);
        }
      } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Failed to load dashboard', 'error');
      }
    };

    void load();
  }, [isAdmin, isAnalyst, isViewer, showMessage]);

  const widgets = [
    { label: 'Total Income', value: summary?.totalIncome ?? 0 },
    { label: 'Total Expense', value: summary?.totalExpense ?? 0 },
    { label: 'Net Balance', value: summary?.net ?? summary?.balance ?? 0 },
    { label: 'Records', value: summary?.recordCount ?? 0 },
  ];

  const analystWidgets = [
    { label: 'Savings Rate', value: `${summary?.savingsRate ?? 0}%` },
  ];

  const monthlySeries = useMemo(() => buildMonthlySeries(chartRecords), [chartRecords]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Dashboard Summary
      </Typography>
      <SummaryWidgets items={widgets} />
      {(isAdmin || isAnalyst) && <SummaryWidgets items={analystWidgets} />}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Recent Transactions
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDate(record.date)}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell align="right">{record.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {recentRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No recent transactions</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Monthly Income vs Expense
        </Typography>
        {monthlySeries.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlySeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tickFormatter={formatMonthLabel} />
              <YAxis />
              <Tooltip labelFormatter={(value) => formatMonthLabel(String(value))} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#2e7d32" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#c62828" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary">Not enough data to render monthly chart.</Typography>
        )}
      </Paper>
    </Stack>
  );
};

export default DashboardPage;
