import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

const formatVital = (value) => value ?? '--';

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

const LiveTelemetryCard = ({ subscribeToVitals }) => {
	const [vitals, setVitals] = useState({
		heartRate: null,
		spO2: null,
	});

	useEffect(() => {
		if (!subscribeToVitals) {
			return undefined;
		}

		const handleVitalsUpdate = (payload) => {
			const update = payload?.new ?? payload;
			if (!update || typeof update !== 'object') {
				return;
			}

			setVitals((currentVitals) => ({
				heartRate: update.heartRate !== undefined
				// reset heartrate and spO2 to null if the update is an empty object, otherwise preserve the current values
					? update.heartRate
					: Object.keys(update).length === 0
					? null
					: currentVitals.heartRate,
				spO2: update.spO2 !== undefined
					? update.spO2
					: Object.keys(update).length === 0
					? null
					: currentVitals.spO2,
			}));
		};

		const unsubscribe = subscribeToVitals(handleVitalsUpdate);
		return typeof unsubscribe === 'function' ? unsubscribe : undefined;
	}, [subscribeToVitals]);

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
};

TelemetryPanel.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	unit: PropTypes.string.isRequired,
	tone: PropTypes.string.isRequired,
};

export default LiveTelemetryCard;
