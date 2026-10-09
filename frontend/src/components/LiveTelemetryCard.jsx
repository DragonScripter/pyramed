import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

const formatVital = (value) => value ?? '--';
const toNumericVital = (value) => {
	if (value === null || value === undefined || value === '') {
		return null;
	}

	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? numericValue : null;
};

const TelemetryPanel = ({ label, value, unit, tone }) => (
	<div className={`telemetry-panel telemetry-panel--${tone}`}>
		<Typography className="telemetry-panel__label" variant="overline">
			{label}
		</Typography>
		<div className="telemetry-panel__reading">
			<Typography className="telemetry-panel__value" variant="h3" component="p">
				{value}
			</Typography>
			<Typography className="telemetry-panel__unit" variant="body2">
				{unit}
			</Typography>
		</div>
	</div>
);

const LiveTelemetryCard = ({ subscribeToVitals, onAlarmChange }) => {
	const currentVitalsRef = useRef({ heartRate: null, spO2: null });
	const [vitals, setVitals] = useState({ heartRate: null, spO2: null });

	useEffect(() => {
		if (!subscribeToVitals) {
			return undefined;
		}

		const handleVitalsUpdate = (payload) => {
			const update = payload?.new ?? payload;
			if (!update || typeof update !== 'object') {
				return;
			}

			const isEmptyUpdate = Object.keys(update).length === 0;
			const nextVitals = isEmptyUpdate
				? { heartRate: null, spO2: null }
				: {
					heartRate: update.heartRate !== undefined
						? update.heartRate
						: currentVitalsRef.current.heartRate,
					spO2: update.spO2 !== undefined
						? update.spO2
						: update.oxygenSaturation !== undefined
							? update.oxygenSaturation
							: currentVitalsRef.current.spO2,
				};

			currentVitalsRef.current = nextVitals;
			setVitals(nextVitals);

			const violations = [];
			const oxygenSaturation = toNumericVital(nextVitals.spO2);
			const heartRate = toNumericVital(nextVitals.heartRate);

			if (oxygenSaturation !== null && oxygenSaturation < 90) {
				violations.push({ metric: 'SpO2', value: oxygenSaturation, unit: '%' });
			}

			if (heartRate !== null && heartRate > 120) {
				violations.push({ metric: 'HR', value: heartRate, unit: 'bpm' });
			}

			onAlarmChange?.({
				isAlarmActive: violations.length > 0,
				violations,
			});
		};

		const unsubscribe = subscribeToVitals(handleVitalsUpdate);
		return typeof unsubscribe === 'function' ? unsubscribe : undefined;
	}, [subscribeToVitals, onAlarmChange]);

	return (
		<Card component="section" className="live-telemetry-card" aria-labelledby="live-telemetry-title">
			<CardContent>
				<Typography id="live-telemetry-title" variant="overline" color="text.secondary">
					Live bedside telemetry
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					Current vitals
				</Typography>
				<div className="telemetry-grid">
					<TelemetryPanel
						label="Heart rate"
						value={formatVital(vitals.heartRate)}
						unit="bpm"
						tone="heart-rate"
					/>
					<TelemetryPanel
						label="Oxygen saturation"
						value={formatVital(vitals.spO2)}
						unit="SpO2%"
						tone="oxygen-saturation"
					/>
				</div>
			</CardContent>
		</Card>
	);
};

LiveTelemetryCard.propTypes = {
	subscribeToVitals: PropTypes.func,
	onAlarmChange: PropTypes.func,
};

TelemetryPanel.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	unit: PropTypes.string.isRequired,
	tone: PropTypes.string.isRequired,
};

export default LiveTelemetryCard;
