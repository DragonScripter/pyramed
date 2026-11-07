
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import BodyCompositionCharts from './BodyCompositionCharts';
import BodyCompositionSummary from './BodyCompositionSummary';

export default function BodyCompositionResults({
  data = [],
  loading = false,
  error = null,
  onRetry,
}) {
  // Loading state
  if (loading) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 6,
        }}
      >
        <CircularProgress size={28} />
        <Typography>Loading body composition data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          typeof onRetry === 'function' ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
      >
        Unable to load body composition data.
        {typeof error === 'string' ? ` ${error}` : ''}
      </Alert>
    );
  }

  // Empty state
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Alert severity="info">
        No body composition measurements are available
        for the selected patient and time range.
      </Alert>
    );
  }

  // Success state
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" component="h2">
        Body Composition Summary
      </Typography>

      <BodyCompositionSummary data={data} />

      <Typography variant="h6" component="h2">
        Body Composition Trends
      </Typography>

      <BodyCompositionCharts data={data} />
    </Box>
  );
}
