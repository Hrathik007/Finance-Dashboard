import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAuditEntries } from '../api/audit';
import AuditTable from '../components/AuditTable';
import { useAppSnackbar } from '../components/useAppSnackbar';
import type { AuditEntry } from '../types';

const AuditPage = () => {
  const { showMessage } = useAppSnackbar();
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const response = await getAuditEntries();
        setEntries(response);
      } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Failed to load audit logs', 'error');
      }
    };

    void loadAudit();
  }, [showMessage]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Audit Logs
      </Typography>
      <AuditTable entries={entries} />
    </Stack>
  );
};

export default AuditPage;
