
const getAlertKey = (violation) => {
  return String(violation.metric);
};

export function createAlertEventTracker() {
  const activeAlerts = new Set();

  function processAlarmChange(alarmState, notify) {
    const violations = alarmState?.isAlarmActive
      ? alarmState.violations ?? []
      : [];

    const currentAlerts = new Set();

    for (const violation of violations) {
      const key = getAlertKey(violation);
      currentAlerts.add(key);

      if (!activeAlerts.has(key)) {
        notify({
          id: `${key}-${Date.now()}`,
          type: 'critical',
          severity: 'critical',
          metric: violation.metric,
          message: `${violation.metric}: ${violation.value} ${violation.unit}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    activeAlerts.clear();

    for (const key of currentAlerts) {
      activeAlerts.add(key);
    }
  }

  return { processAlarmChange };
}
