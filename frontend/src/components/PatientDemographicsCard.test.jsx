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
		const onConnectionChange = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		render(
			<PatientDemographicsCard
				patientId={patient.patientId}
				onConnectionChange={onConnectionChange}
			/>
		);

		expect(await screen.findByRole('heading', { name: patient.name })).toBeInTheDocument();
		expect(screen.getByText(`${patient.age} years`)).toBeInTheDocument();
		expect(screen.getByText(patient.status)).toBeInTheDocument();
		expect(screen.getByText(patient.patientId)).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(fetchMock.mock.calls[0][0]).toContain(
			`/api/patient/${encodeURIComponent(patient.patientId)}`
		);
		expect(onConnectionChange).toHaveBeenLastCalledWith(true);
	});

	it('reports disconnected when no patient ID is selected', () => {
		const fetchMock = vi.fn();
		const onConnectionChange = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		render(<PatientDemographicsCard onConnectionChange={onConnectionChange} />);

		expect(onConnectionChange).toHaveBeenCalledWith(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('reports disconnected when the patient request fails', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
		const onConnectionChange = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		render(
			<PatientDemographicsCard
				patientId="c7a3d4f2-43d7-4ee4-b7e7-55f8ca6c6a91"
				onConnectionChange={onConnectionChange}
			/>
		);

		expect(await screen.findByText(/503/)).toBeInTheDocument();
		expect(onConnectionChange).toHaveBeenLastCalledWith(false);
	});
});