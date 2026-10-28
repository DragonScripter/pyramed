import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const usePatientVitals = (activePatientId) => {
	const [latestVital, setLatestVital] = useState({
		patientId: activePatientId,
		payload: null,
	});

	useEffect(() => {
		if (!activePatientId) {
			return undefined;
		}

		const channel = supabase
			.channel(`vitals-${activePatientId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'vitals',
					filter: `patient_id=eq.${activePatientId}`,
				},
				(payload) => setLatestVital({ patientId: activePatientId, payload })
			)
			.subscribe((status, error) => {
				if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
					console.error('Supabase vitals subscription failed:', error ?? status);
				}
			});

		return () => {
			void supabase.removeChannel(channel);
		};
	}, [activePatientId]);

	return latestVital.patientId === activePatientId
		? latestVital.payload
		: null;
};

export default usePatientVitals;
