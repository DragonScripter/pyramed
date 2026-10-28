// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const { channel, supabase } = vi.hoisted(() => {
	const channel = {
		on: vi.fn(),
		subscribe: vi.fn(),
	};
	channel.on.mockReturnValue(channel);
	channel.subscribe.mockReturnValue(channel);

	return {
		channel,
		supabase: {
			channel: vi.fn(() => channel),
			removeChannel: vi.fn(),
		},
	};
});

vi.mock('./supabaseClient', () => ({ supabase }));
vi.mock('./components/PatientDemographicsCard', () => ({ default: () => null }));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe('telemetry route navigation', () => {
	it('resets demo readings when returning to the live bedside chart', async () => {
		vi.useFakeTimers();
		render(
			<MemoryRouter initialEntries={['/demo-telemetry']}>
				<App />
			</MemoryRouter>
		);

		await act(async () => {
			vi.advanceTimersByTime(2500);
		});
		expect(screen.getByText('72')).toBeInTheDocument();
		expect(screen.getByText('98')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
		fireEvent.click(screen.getByRole('link', { name: 'Live Bedside Chart' }));

		expect(screen.getAllByText('--')).toHaveLength(2);
	});

	it('shows and clears alert evidence from the demo telemetry stream', async () => {
		vi.useFakeTimers();
		render(
			<MemoryRouter initialEntries={['/demo-telemetry']}>
	it('subscribes to patient-specific vital inserts and removes the channel on unmount', () => {
		const { unmount } = render(
			<MemoryRouter initialEntries={['/patients/patient-123']}>
				<App />
			</MemoryRouter>
		);

		await act(async () => {
			vi.advanceTimersByTime(5000);
		});
		expect(screen.getByText(
			'Flagged as critical because SpO2 fell to 89%, crossing the minimum baseline safety threshold of 90%.',
		)).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Active critical alert evidence: 1 reason requires review.');

		await act(async () => {
			vi.advanceTimersByTime(5000);
		});
		expect(screen.getByRole('status')).toHaveTextContent('No active alert reasons.');
	});
});
		expect(supabase.channel).toHaveBeenCalledWith('vitals-patient-123');
		expect(channel.on).toHaveBeenCalledWith(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'vitals',
				filter: 'patient_id=eq.patient-123',
			},
			expect.any(Function)
		);
		expect(channel.subscribe).toHaveBeenCalledOnce();

		unmount();

		expect(supabase.removeChannel).toHaveBeenCalledWith(channel);
	});
});
