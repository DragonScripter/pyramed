import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export default function useCdsEvaluation(patientId, refreshMs = 10000) {
  const [result, setResult] = useState({ key: null, evaluation: null, error: null });
  const [tick, setTick] = useState(0);

  // Re-fetch on an interval while a patient is selected.
  useEffect(() => {
    if (!patientId || !refreshMs) return undefined;
    const timer = setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => clearInterval(timer);
  }, [patientId, refreshMs]);

  useEffect(() => {
    if (!patientId) return undefined;

    const controller = new AbortController();

    fetch(`${API_BASE_URL}/api/cds/evaluate/${patientId}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) return null; // no vitals recorded yet
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((evaluation) =>
        setResult({ key: patientId, evaluation, error: null }),
      )
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Keep the last good evaluation for this patient if a refresh fails.
        setResult((prev) => ({
          key: patientId,
          evaluation: prev.key === patientId ? prev.evaluation : null,
          error: err.message,
        }));
      });

    return () => controller.abort();
  }, [patientId, tick]);

  const isCurrent = result.key === patientId;
  return {
    evaluation: isCurrent ? result.evaluation : null,
    loading: Boolean(patientId) && !isCurrent,
    error: isCurrent ? result.error : null,
  };
}