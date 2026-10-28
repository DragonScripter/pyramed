
import { supabase } from './supabaseClient';

export function subscribeToPatientVitals(patientId, onUpdate) {
  if (!patientId) {
    return () => {};
  }

  const channel = supabase
    .channel(`patient-vitals-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'vitals',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload);
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
