import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createRecord, deleteRecord, filterRecords, getRecords, updateRecord } from '../api/records';
import { hasRole } from '../auth/token';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import RecordForm from '../components/RecordForm';
import { useAppSnackbar } from '../components/useAppSnackbar';
import type {
  FinancialRecordDTO,
  FinancialRecordResponse,
  RecordFilterParams,
  RecordType,
} from '../types';

const defaultPageSize = 10;

const RecordsPage = () => {
  const isAdmin = hasRole('ROLE_ADMIN');
  const { showMessage } = useAppSnackbar();
  const [records, setRecords] = useState<FinancialRecordResponse[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(defaultPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<RecordType | ''>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecordDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialRecordResponse | null>(null);

  const hasFilter = useMemo(
    () => Boolean(filterStart || filterEnd || filterCategory || filterType),
    [filterCategory, filterEnd, filterStart, filterType],
  );

  const handleError = (error: unknown, fallback = 'Request failed') => {
    showMessage(error instanceof Error ? error.message : fallback, 'error');
  };

  const loadRecords = async (nextPage = page, nextSize = size) => {
    setLoading(true);
    try {
      const response = hasFilter
        ? await filterRecords({
            start: filterStart || undefined,
            end: filterEnd || undefined,
            category: filterCategory || undefined,
            type: filterType || undefined,
            page: nextPage,
            size: nextSize,
          } as RecordFilterParams)
        : await getRecords(nextPage, nextSize);

      setRecords(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setPage(response.pageNumber);
      setSize(response.pageSize);
    } catch (error) {
      handleError(error, 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords(0, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = () => {
    setSelectedRecord(null);
    setDialogOpen(true);
  };

  const onEdit = (record: FinancialRecordResponse) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const onSubmitRecord = async (payload: FinancialRecordDTO) => {
    try {
      if (payload.id) {
        await updateRecord(payload);
        showMessage('Record updated', 'success');
      } else {
        await createRecord(payload);
        showMessage('Record created', 'success');
      }
      await loadRecords();
    } catch (error) {
      handleError(error, 'Failed to save record');
      throw error;
    }
  };

  const onDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      await deleteRecord(deleteTarget.id);
      showMessage('Record deleted', 'success');
      setDeleteTarget(null);
      await loadRecords();
    } catch (error) {
      handleError(error, 'Failed to delete record');
    }
  };

  const applyFilters = async () => {
    await loadRecords(0, size);
  };

  const clearFilters = async () => {
    setFilterStart('');
    setFilterEnd('');
    setFilterCategory('');
    setFilterType('');

    setLoading(true);
    try {
      const response = await getRecords(0, size);
      setRecords(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setPage(response.pageNumber);
      setSize(response.pageSize);
    } catch (error) {
      handleError(error, 'Failed to clear filters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Financial Records
        </Typography>
        {isAdmin && (
          <Button variant="contained" onClick={onCreate}>
            Add Record
          </Button>
        )}
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            fullWidth
          />
          <TextField
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            fullWidth
          />
          <TextField
            label="Type"
            select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as RecordType | '')}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="INCOME">INCOME</MenuItem>
            <MenuItem value="EXPENSE">EXPENSE</MenuItem>
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => void applyFilters()}>
              Apply
            </Button>
            <Button variant="outlined" onClick={() => void clearFilters()}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Notes</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell align="right">{record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.notes ?? '-'}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => onEdit(record)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setDeleteTarget(record)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && records.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6}>
                  <Box sx={{ py: 2, textAlign: 'center' }}>No records found</Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, nextPage) => void loadRecords(nextPage, size)}
          rowsPerPage={size}
          onRowsPerPageChange={(event) => {
            const nextSize = parseInt(event.target.value, 10);
            void loadRecords(0, nextSize);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count} (pages: ${totalPages}, page: ${page + 1})`
          }
        />
      </Paper>

      <RecordForm
        open={dialogOpen}
        initialValue={selectedRecord}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmitRecord}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Record"
        message={`Are you sure you want to delete record #${deleteTarget?.id ?? ''}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onDelete()}
      />

    </>
  );
};

export default RecordsPage;
