import { describe, expect, it } from 'vitest';
import { evaluateCriticalAlerts, formatAlertReason } from './alertEvidence';

describe('alert evidence', () => {
  it('does not flag values at the inclusive safety boundaries', () => {
    expect(evaluateCriticalAlerts({ heartRate: 120, spO2: 90 })).toEqual([]);
  });

  it('maps every breached metric with its threshold and comparison', () => {
    expect(evaluateCriticalAlerts({ heartRate: 130, spO2: 87 })).toEqual([
      {
        metric: 'SpO2',
        vitalName: 'SpO2',
        value: 87,
        unit: '%',
        threshold: 90,
        comparison: 'below',
        severity: 'critical',
      },
      {
        metric: 'HR',
        vitalName: 'Heart rate',
        value: 130,
        unit: 'bpm',
        threshold: 120,
        comparison: 'above',
        severity: 'critical',
      },
    ]);
  });

  it('creates a readable mathematical reason from live alert evidence', () => {
    expect(formatAlertReason({ metric: 'SpO2', value: 87, unit: '%' })).toBe(
      'Flagged as critical because SpO2 fell to 87%, crossing the minimum baseline safety threshold of 90%.',
    );
    expect(formatAlertReason({ metric: 'HR', value: 130, unit: 'bpm' })).toBe(
      'Flagged as critical because Heart rate rose to 130 bpm, crossing the maximum baseline safety threshold of 120 bpm.',
    );
  });
});
