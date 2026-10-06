// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LiveTelemetryCard from './LiveTelemetryCard';

afterEach(cleanup);

const createVitalsStream = () => {
	let onUpdate;
	const unsubscribe = vi.fn();
	const subscribeToVitals = vi.fn((handler) => {
		onUpdate = handler;
		return unsubscribe;
	});

	return {
		subscribeToVitals,
		unsubscribe,
		emit: (payload) => onUpdate(payload),
	};
};

describe('LiveTelemetryCard', () => {
	it('shows placeholders and units before telemetry arrives', () => {
		render(<LiveTelemetryCard />);

		expect(screen.getAllByText('--')).toHaveLength(2);
		expect(screen.getByText('bpm')).toBeInTheDocument();
		expect(screen.getByText('SpO2%')).toBeInTheDocument();
	});

	it('updates displayed values from stream data and preserves partial values', async () => {
		const stream = createVitalsStream();
		render(<LiveTelemetryCard subscribeToVitals={stream.subscribeToVitals} />);

		await act(async () => stream.emit({ heartRate: 72, spO2: 98 }));
		expect(screen.getByText('72')).toBeInTheDocument();
		expect(screen.getByText('98')).toBeInTheDocument();

		await act(async () => stream.emit({ heartRate: 74 }));
		expect(screen.getByText('74')).toBeInTheDocument();
		expect(screen.getByText('98')).toBeInTheDocument();

		await act(async () => stream.emit({ new: { oxygenSaturation: 97 } }));
		expect(screen.getByText('74')).toBeInTheDocument();
		expect(screen.getByText('97')).toBeInTheDocument();
	});

	it('unsubscribes when the component unmounts', () => {
		const stream = createVitalsStream();
		const { unmount } = render(
			<LiveTelemetryCard subscribeToVitals={stream.subscribeToVitals} />
		);
		expect(stream.subscribeToVitals).toHaveBeenCalledOnce();

		unmount();

		expect(stream.unsubscribe).toHaveBeenCalledOnce();
	});
});