
import { describe, it, expect, vi } from 'vitest';
import { createAlertEventTracker } from './alertEventTracker';

describe('Alert Event Tracker', () => {
  it('notifies when a new critical alert occurs', () => {
    const tracker = createAlertEventTracker();
    const notify = vi.fn();

    tracker.processAlarmChange({
      isAlarmActive: true,
      violations: [
        { metric: 'SpO2', value: 89, unit: '%' },
      ],
    }, notify);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'critical',
        metric: 'SpO2',
      })
    );
  });

  it('suppresses repeated alerts for the same condition', () => {
    const tracker = createAlertEventTracker();
    const notify = vi.fn();

    const alarm = {
      isAlarmActive: true,
      violations: [
        { metric: 'SpO2', value: 89, unit: '%' },
      ],
    };

    tracker.processAlarmChange(alarm, notify);
    tracker.processAlarmChange(alarm, notify);

    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('notifies again after an alert resolves and returns', () => {
    const tracker = createAlertEventTracker();
    const notify = vi.fn();

    const alarm = {
      isAlarmActive: true,
      violations: [
        { metric: 'HR', value: 125, unit: 'bpm' },
      ],
    };

    tracker.processAlarmChange(alarm, notify);

    tracker.processAlarmChange({
      isAlarmActive: false,
      violations: [],
    }, notify);

    tracker.processAlarmChange(alarm, notify);

    expect(notify).toHaveBeenCalledTimes(2);
  });

  it('tracks different critical conditions independently', () => {
    const tracker = createAlertEventTracker();
    const notify = vi.fn();

    tracker.processAlarmChange({
      isAlarmActive: true,
      violations: [
        { metric: 'HR', value: 125, unit: 'bpm' },
        { metric: 'SpO2', value: 89, unit: '%' },
      ],
    }, notify);

    expect(notify).toHaveBeenCalledTimes(2);
  });
});
