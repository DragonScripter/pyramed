// #Yena: This component is dedicated to displaying the patient's demographic information.

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

const PatientDemographicsCard = ({ patient }) => {
  return (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                Patient Demographics
            </Typography>
            < Typography variant="body1">
                <strong>Patient ID:</strong> {patient.id}
            </Typography>
            <Typography variant="body1">
                <strong>Name:</strong> {patient.name}
            </Typography>
            <Typography variant="body1">
                <strong>Age:</strong> {patient.age}
            </Typography>
            <Typography variant="body1">
                <strong>Status:</strong> {patient.status}
            </Typography>
            <Typography variant="body1">
                <strong>Created At:</strong> {new Date(patient.createdAt).toLocaleString()}
            </Typography>
        </CardContent>
    </Card>
  );
};

PatientDemographicsCard.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired
};

export default PatientDemographicsCard;