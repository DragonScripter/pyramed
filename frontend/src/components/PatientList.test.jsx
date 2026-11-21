// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PatientList from './PatientList';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderPatientList = (patients) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => patients,
    })
  );

  return render(
    <MemoryRouter>
      <PatientList />
    </MemoryRouter>
  );
};

describe('PatientList', () => {
  it('shows patient details, avatar, triage status, and the patient detail link', async () => {
    const patient = {
      patientId: 'patient-123',
      name: 'Ada Lovelace',
      age: 42,
      avatarUrl: 'https://example.com/ada.png',
      status: 'Admitted',
      statusSummary: { level: 'Warning', reasons: ['No recent vitals'] },
    };

    renderPatientList([patient]);

    expect(await screen.findByText(patient.name)).toBeInTheDocument();
    expect(screen.getByText('Age: 42 · Admission status: Admitted')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ada Lovelace avatar' })).toHaveAttribute(
      'src',
      patient.avatarUrl
    );
    expect(screen.getByLabelText('Patient triage status: Warning')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
      'href',
      '/patients/patient-123'
    );
  });

  it('falls back to initials when an avatar is unavailable or fails to load', async () => {
    renderPatientList([
      {
        patientId: 'patient-no-avatar',
        name: 'Grace Hopper',
        age: 85,
        avatarUrl: null,
        statusSummary: { level: 'Stable', reasons: [] },
      },
      {
        patientId: 'patient-broken-avatar',
        name: 'Katherine Johnson',
        age: 101,
        avatarUrl: 'https://example.com/missing.png',
        statusSummary: { level: 'Critical', reasons: ['Active critical alert'] },
      },
    ]);

    expect(await screen.findByText('GH')).toBeInTheDocument();

    fireEvent.error(
      screen.getByRole('img', { name: 'Katherine Johnson avatar' })
    );

    expect(await screen.findByText('KJ')).toBeInTheDocument();
  });

  it('uses safe display fallbacks for incomplete patient data', async () => {
    renderPatientList([
      {
        patientId: 'patient-incomplete',
        name: ' ',
        age: null,
        statusSummary: null,
      },
    ]);

    expect(await screen.findByText('Unknown patient')).toBeInTheDocument();
    expect(screen.getByText('Age unavailable · Admission status: Unknown')).toBeInTheDocument();
    expect(screen.getByText('UP')).toBeInTheDocument();
    expect(screen.getByLabelText('Patient triage status: Unknown')).toBeInTheDocument();
  });
});
