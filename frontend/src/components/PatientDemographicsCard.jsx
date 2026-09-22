// #Yena: This component is dedicated to displaying the patient's demographic information.

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const PatientDemographicsCard = ({ patientId: initialPatientId }) => {
  const [patientId] = useState(initialPatientId);
  const selectedPatientId = initialPatientId ?? patientId;
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPatientId) {
      return undefined;
    }

    const controller = new AbortController();

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

        setPatientData(await response.json());
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setPatientData(null);
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPatient();

    return () => controller.abort();
  }, [selectedPatientId]);

  if (!selectedPatientId) {
    return <Typography>Error: No patient selected.</Typography>;
  }

  if (isLoading) {
    return <Typography>Loading patient information...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!patientData) {
    return <Typography>Error: Patient information not found.</Typography>;
  }

  return (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                Patient Demographics
            </Typography>
            <Typography variant="body1">
              <strong>Patient ID:</strong> {patientData.patientId ?? patientData.id}
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {patientData.name}
            </Typography>
            <Typography variant="body1">
              <strong>Age:</strong> {patientData.age}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {patientData.status}
            </Typography>
            <Typography variant="body1">
              <strong>Created At:</strong> {new Date(patientData.createdAt).toLocaleString()}
            </Typography>
        </CardContent>
    </Card>
  );
};

PatientDemographicsCard.propTypes = {
  patientId: PropTypes.string
};

export default PatientDemographicsCard;