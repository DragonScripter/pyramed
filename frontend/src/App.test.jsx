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
			vi.advanceTimersByTime(1200);
		});
		expect(screen.getByText('72')).toBeInTheDocument();
		expect(screen.getByText('98')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
		fireEvent.click(screen.getByRole('link', { name: 'Live Bedside Chart' }));

		expect(screen.getAllByText('--')).toHaveLength(2);
	});
});