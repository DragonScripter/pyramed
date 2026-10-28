const CRITICAL_ALERT_RULES = [
  {
    metric: 'SpO2',
    vitalName: 'SpO2',
    valueKey: 'spO2',
    unit: '%',
    threshold: 90,
    comparison: 'below',
    severity: 'critical',
  },
  {
    metric: 'HR',
    vitalName: 'Heart rate',
    valueKey: 'heartRate',
    unit: 'bpm',
    threshold: 120,
    comparison: 'above',
    severity: 'critical',
  },
];

const toNumericVital = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const formatValue = (value, unit) =>
  unit === '%' ? `${value}%` : `${value} ${unit}`;

const findRule = (metric) =>
  CRITICAL_ALERT_RULES.find((rule) => rule.metric === metric);

export const evaluateCriticalAlerts = (vitals) =>
  CRITICAL_ALERT_RULES.flatMap((rule) => {
    const value = toNumericVital(vitals[rule.valueKey]);
    const hasBreachedLimit = rule.comparison === 'below'
      ? value !== null && value < rule.threshold
      : value !== null && value > rule.threshold;

    return hasBreachedLimit
      ? [{
        metric: rule.metric,
        vitalName: rule.vitalName,
        value,
        unit: rule.unit,
        threshold: rule.threshold,
        comparison: rule.comparison,
        severity: rule.severity,
      }]
      : [];
  });

export const formatAlertReason = (violation) => {
  const rule = findRule(violation.metric);
  const evidence = { ...rule, ...violation };
  const severity = evidence.severity ?? 'critical';
  const vitalName = evidence.vitalName ?? evidence.metric;

  if (evidence.threshold === undefined || !evidence.comparison) {
    return `Flagged as ${severity} because ${vitalName} reached ${formatValue(evidence.value, evidence.unit)}.`;
  }

  const direction = evidence.comparison === 'below' ? 'fell to' : 'rose to';
  const baseline = evidence.comparison === 'below' ? 'minimum' : 'maximum';

  return `Flagged as ${severity} because ${vitalName} ${direction} ${formatValue(evidence.value, evidence.unit)}, crossing the ${baseline} baseline safety threshold of ${formatValue(evidence.threshold, evidence.unit)}.`;
};
