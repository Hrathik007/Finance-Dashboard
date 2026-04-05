import { Grid, Paper, Typography } from '@mui/material';

interface SummaryWidgetsProps {
  items: Array<{ label: string; value: string | number }>;
}

const SummaryWidgets = ({ items }: SummaryWidgetsProps) => (
  <Grid container spacing={2}>
    {items.map((item) => (
      <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

export default SummaryWidgets;
