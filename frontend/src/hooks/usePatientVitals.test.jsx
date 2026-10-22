// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import usePatientVitals from './usePatientVitals';

const { supabase } = vi.hoisted(() => ({
	supabase: {
		channel: vi.fn(),
		removeChannel: vi.fn(),
	},
}));

vi.mock('../supabaseClient', () => ({ supabase }));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe('usePatientVitals', () => {
	it('subscribes to inserts for the active patient and returns the payload', () => {
		let onPayload;
		const channel = {
			on: vi.fn((event, config, callback) => {
				onPayload = callback;
				return channel;
			}),
			subscribe: vi.fn(() => channel),
		};
		supabase.channel.mockReturnValue(channel);

		const { result, unmount } = renderHook(() => usePatientVitals('patient-123'));

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

		const payload = { new: { patient_id: 'patient-123', heart_rate: 72, spo2: 98 } };
		act(() => onPayload(payload));
		expect(result.current).toBe(payload);

		unmount();
		expect(supabase.removeChannel).toHaveBeenCalledWith(channel);
	});

	it('cleans up and resubscribes when the active patient changes', () => {
		const channels = [];
		supabase.channel.mockImplementation((name) => {
			const channel = {
				name,
				on: vi.fn(() => channel),
				subscribe: vi.fn(() => channel),
			};
			channels.push(channel);
			return channel;
		});

		const { rerender } = renderHook(
			({ patientId }) => usePatientVitals(patientId),
			{ initialProps: { patientId: 'patient-123' } }
		);

		rerender({ patientId: 'patient-456' });

		expect(supabase.removeChannel).toHaveBeenCalledWith(channels[0]);
		expect(supabase.channel).toHaveBeenNthCalledWith(2, 'vitals-patient-456');
		expect(channels[1].on).toHaveBeenCalledWith(
			'postgres_changes',
			expect.objectContaining({ filter: 'patient_id=eq.patient-456' }),
			expect.any(Function)
		);
	});

	it('does not open a channel without an active patient ID', () => {
		renderHook(() => usePatientVitals(''));

		expect(supabase.channel).not.toHaveBeenCalled();
	});
});
