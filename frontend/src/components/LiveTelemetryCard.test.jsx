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

	it('activates alarms for breached thresholds and clears them when values normalize', async () => {
		const stream = createVitalsStream();
		const onAlarmChange = vi.fn();
		render(
			<LiveTelemetryCard
				subscribeToVitals={stream.subscribeToVitals}
				onAlarmChange={onAlarmChange}
			/>
		);

		await act(async () => stream.emit({ heartRate: 120, spO2: 90 }));
		expect(onAlarmChange).toHaveBeenLastCalledWith({
			isAlarmActive: false,
			violations: [],
		});

		await act(async () => stream.emit({ heartRate: 130, spO2: 88 }));
		expect(onAlarmChange).toHaveBeenLastCalledWith({
			isAlarmActive: true,
			violations: [
				{ metric: 'SpO2', value: 88, unit: '%' },
				{ metric: 'HR', value: 130, unit: 'bpm' },
			],
		});
		expect(screen.getByText('130')).toBeInTheDocument();
		expect(screen.getByText('88')).toBeInTheDocument();

		await act(async () => stream.emit({ heartRate: 120 }));
		expect(onAlarmChange).toHaveBeenLastCalledWith({
			isAlarmActive: true,
			violations: [{ metric: 'SpO2', value: 88, unit: '%' }],
		});

		await act(async () => stream.emit({ spO2: 90 }));
		expect(onAlarmChange).toHaveBeenLastCalledWith({
			isAlarmActive: false,
			violations: [],
		});
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