// #Yena: This component is dedicated to displaying the patient's demographic information.

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const PatientDemographicsCard = ({ patientId: initialPatientId, onConnectionChange }) => {
  const [patientId] = useState(initialPatientId);
  const selectedPatientId = initialPatientId ?? patientId;
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPatientId) {
      onConnectionChange?.(false);
      return undefined;
    }

    const controller = new AbortController();
    onConnectionChange?.(false);

    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/patient/${encodeURIComponent(selectedPatientId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Error: Cannot fetch patient information. (${response.status})`);
        }

        const patient = await response.json();
        setPatientData(patient);
        onConnectionChange?.(true);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setPatientData(null);
          setError(requestError.message);
          onConnectionChange?.(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPatient();

    return () => controller.abort();
  }, [selectedPatientId, onConnectionChange]);

  if (!selectedPatientId) {
    return (
      <Alert severity="info">
        Select a patient to view bedside information.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card aria-busy="true">
        <CardContent>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} aria-label="Loading patient information" />
            <Typography color="text.secondary">Loading patient information...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!patientData) {
    return <Alert severity="warning">Patient information not found.</Alert>;
  }

  return (
    <Card component="section" aria-labelledby="patient-demographics-title">
      <CardContent>
        <Typography id="patient-demographics-title" variant="overline" color="text.secondary">
          Patient demographics
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {patientData.name}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <div>
            <Typography variant="caption" color="text.secondary">Age</Typography>
            <Typography variant="h6">{patientData.age} years</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Admission status</Typography>
            <Typography variant="h6">{patientData.status}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Patient ID</Typography>
            <Typography variant="h6">{patientData.patientId ?? patientData.id}</Typography>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
};

PatientDemographicsCard.propTypes = {
  patientId: PropTypes.string,
  onConnectionChange: PropTypes.func,
};

export default PatientDemographicsCard;