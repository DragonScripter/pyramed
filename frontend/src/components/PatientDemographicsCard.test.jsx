// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PatientDemographicsCard from './PatientDemographicsCard';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe('PatientDemographicsCard', () => {
	it('renders demographics from the patient API response', async () => {
		const patient = {
			patientId: 'c7a3d4f2-43d7-4ee4-b7e7-55f8ca6c6a91',
			name: 'Ada Lovelace',
			age: 42,
			status: 'Admitted',
			createdAt: '2026-10-09T12:00:00Z',
		};
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => patient,
		});
		vi.stubGlobal('fetch', fetchMock);

		render(<PatientDemographicsCard patientId={patient.patientId} />);

		expect(await screen.findByRole('heading', { name: patient.name })).toBeInTheDocument();
		expect(screen.getByText(`${patient.age} years`)).toBeInTheDocument();
		expect(screen.getByText(patient.status)).toBeInTheDocument();
		expect(screen.getByText(patient.patientId)).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(fetchMock.mock.calls[0][0]).toContain(
			`/api/patient/${encodeURIComponent(patient.patientId)}`
		);
	});
});