// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

afterEach(() => {
	cleanup();
	vi.useRealTimers();
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
				<App />
			</MemoryRouter>
		);

		await act(async () => {
			vi.advanceTimersByTime(5000);
		});
		expect(screen.getByText(
			'Flagged as critical because SpO2 fell to 89%, crossing the minimum baseline safety threshold of 90%.',
		)).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Active critical alert evidence: 1 reason require review.');

		await act(async () => {
			vi.advanceTimersByTime(5000);
		});
		expect(screen.getByRole('status')).toHaveTextContent('No active alert reasons.');
	});
});
