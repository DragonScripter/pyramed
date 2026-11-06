
import { Chip, Box } from '@mui/material';

const statusConfig = {
  stable: {
    label: 'Stable',
    color: 'success',
    symbol: '✓',
  },
  warning: {
    label: 'Warning',
    color: 'warning',
    symbol: '⚠',
  },
  critical: {
    label: 'Critical',
    color: 'error',
    symbol: '!',
  },
};

export default function PatientStatusBadge({ statusSummary }) {
  const status = String(statusSummary ?? '')
    .trim()
    .toLowerCase();

  const config = statusConfig[status] ?? {
    label: 'Unknown',
    color: 'default',
    symbol: '?',
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      icon={
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            fontWeight: 800,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {config.symbol}
        </Box>
      }
      size="small"
      variant="outlined"
      aria-label={`Patient triage status: ${config.label}`}
      sx={{
        fontWeight: 700,
        minWidth: 105,
        justifyContent: 'flex-start',
        '& .MuiChip-icon': {
          marginLeft: 1,
        },
      }}
    />
  );
}
