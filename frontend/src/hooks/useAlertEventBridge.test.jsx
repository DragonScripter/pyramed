
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, act } from '@testing-library/react';
import useAlertEventBridge from './useAlertEventBridge';

afterEach(() => {
  cleanup();
});

describe('useAlertEventBridge', () => {
  it('sends a new alert to both toast and activity log', () => {
    const onToast = vi.fn();
    const onLog = vi.fn();

    const { result } = renderHook(() =>
      useAlertEventBridge({ onToast, onLog })
    );

    act(() => {
      result.current({
        isAlarmActive: true,
        violations: [
          { metric: 'SpO2', value: 89, unit: '%' },
        ],
      });
    });

    expect(onToast).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenCalledTimes(1);

    expect(onToast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'critical',
        metric: 'SpO2',
      })
    );

    expect(onLog).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'critical',
        metric: 'SpO2',
      })
    );
  });

  it('does not repeat the same active alert', () => {
    const onToast = vi.fn();
    const onLog = vi.fn();

    const { result } = renderHook(() =>
      useAlertEventBridge({ onToast, onLog })
    );

    const alarm = {
      isAlarmActive: true,
      violations: [
        { metric: 'HR', value: 125, unit: 'bpm' },
      ],
    };

    act(() => {
      result.current(alarm);
      result.current(alarm);
    });

    expect(onToast).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('notifies again after an alert resolves and returns', () => {
    const onToast = vi.fn();
    const onLog = vi.fn();

    const { result } = renderHook(() =>
      useAlertEventBridge({ onToast, onLog })
    );

    const alarm = {
      isAlarmActive: true,
      violations: [
        { metric: 'HR', value: 125, unit: 'bpm' },
      ],
    };

    act(() => {
      result.current(alarm);
      result.current({
        isAlarmActive: false,
        violations: [],
      });
      result.current(alarm);
    });

    expect(onToast).toHaveBeenCalledTimes(2);
    expect(onLog).toHaveBeenCalledTimes(2);
  });
});
