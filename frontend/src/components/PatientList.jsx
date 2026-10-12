import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const SERVER_DOWN_MESSAGE =
  'Server not connected. The patient list can’t be displayed right now.';
const GENERIC_ERROR_MESSAGE =
  'The patient list can’t be displayed right now. Please try again later.';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/patient`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          // 502/503/504 = backend unreachable or down
          throw new Error(
            [502, 503, 504].includes(response.status)
              ? SERVER_DOWN_MESSAGE
              : GENERIC_ERROR_MESSAGE
          );
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.patients ?? [];
        setPatients(list);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setPatients([]);
          setError(
            requestError instanceof TypeError
              ? SERVER_DOWN_MESSAGE
              : requestError.message
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPatients();

    return () => controller.abort();
  }, [reloadKey]);

  if (isLoading) {
    return (
      <Container component="main" maxWidth="md" sx={{ pt: 9, pb: 4 }}>
        <Stack alignItems="center" spacing={1.5} aria-busy="true" sx={{ py: 6 }}>
          <CircularProgress size={28} aria-label="Loading patients" />
          <Typography color="text.secondary">Loading patients...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="md" sx={{ pt: 9, pb: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (patients.length === 0) {
    return (
      <Container component="main" maxWidth="md" sx={{ pt: 9, pb: 4 }}>
        <Alert severity="info">No patients found.</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ pt: 9, pb: 4 }}>
      <Card
        component="section"
        variant="outlined"
        aria-labelledby="patient-list-title"
      >
        <CardContent>
          <Typography
            id="patient-list-title"
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ color: 'text.primary', textAlign: 'left', fontWeight: 600 }}
          >
            Patients
          </Typography>
          <List disablePadding>
            {patients.map((p) => {
              const patientId = p.id ?? p.patientId;
              return (
                <ListItemButton
                  key={patientId}
                  component={Link}
                  to={`/patients/${encodeURIComponent(patientId)}`}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={p.name}
                    secondary={`Admission status: ${p.status ?? 'Unknown'}`}
                    slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PatientList;