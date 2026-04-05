import { Alert, Box, Button, Container, Typography } from '@mui/material';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            Something went wrong
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.message || 'Unexpected application error.'}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload App
          </Button>
        </Box>
      </Container>
    );
  }
}
