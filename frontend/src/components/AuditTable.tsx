import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { AuditEntry } from '../types';
import { formatDateTime } from '../utils/date';

interface AuditTableProps {
  entries: AuditEntry[];
}

const AuditTable = ({ entries }: AuditTableProps) => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Timestamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.id}</TableCell>
            <TableCell>{entry.username}</TableCell>
            <TableCell>{entry.action}</TableCell>
            <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
          </TableRow>
        ))}
        {entries.length === 0 && (
          <TableRow>
            <TableCell colSpan={4}>
              <Typography sx={{ py: 2, textAlign: 'center' }} color="text.secondary">
                No audit entries found
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

export default AuditTable;
