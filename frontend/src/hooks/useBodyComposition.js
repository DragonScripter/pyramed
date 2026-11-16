import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export default function useBodyComposition(patientId, from, to) {
  const [result, setResult] = useState({ key: null, data: [], error: null });
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const requestKey = patientId ? `${patientId}|${from}|${to}|${reloadKey}` : null;

  useEffect(() => {
    if (!requestKey) return undefined;

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    // Date-only "to" would mean midnight at the START of that day, so extend it to end of day.
    if (to) params.set('to', `${to}T23:59:59`);
    const qs = params.toString();

    fetch(
      `${API_BASE_URL}/api/patients/${patientId}/body-composition${qs ? `?${qs}` : ''}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json) =>
        setResult({
          key: requestKey,
          error: null,
          data: (json.points ?? []).map((p) => ({
            date: p.measuredAt,
            bmi: p.bmi,
            bodyFatPercentage: p.bodyFatPercent,
            muscleMass: p.muscleMassKg,
          })),
        }),
      )
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setResult({ key: requestKey, data: [], error: err.message });
        }
      });

    return () => controller.abort();
  }, [requestKey, patientId, from, to]);

  const isCurrent = result.key === requestKey;
  return {
    data: isCurrent ? result.data : [],
    loading: requestKey !== null && !isCurrent,
    error: isCurrent ? result.error : null,
    retry,
  };
}