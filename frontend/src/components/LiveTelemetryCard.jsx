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


const VitalTrend = ({ label, readings, field, color }) => {
    const values = readings
        .map((reading) => toNumericVital(reading[field]))
        .filter((value) => value !== null)
        .slice(-20);

    if (values.length < 2) {
        return (
            <Typography variant="body2" color="text.secondary">
                Waiting for more {label.toLowerCase()} readings...
            </Typography>
        );
    }

    const minimum = Math.min(...values) - 5;
    const maximum = Math.max(...values) + 5;
    const range = maximum - minimum;

    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * 300;
            const y = 90 - ((value - minimum) / range) * 80;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div>
            <Typography variant="subtitle2">{label} trend</Typography>
            <svg
                viewBox="0 0 300 100"
                role="img"
                aria-label={`${label} trend chart`}
                style={{ width: '100%', height: 100 }}
            >
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

const LiveTelemetryCard = ({ subscribeToVitals, onAlarmChange }) => {
	const currentVitalsRef = useRef({ heartRate: null, spO2: null });
	const [vitals, setVitals] = useState({ heartRate: null, spO2: null });
	const [vitalsData, setVitalsData] = useState([]);

	useEffect(() => {
		if (!subscribeToVitals) {
			return undefined;
		}

				const handleVitalsUpdate = (payload) => {
			const update = payload?.new ?? payload;
			if (!update || typeof update !== 'object') {
				return;
			}

			// An empty update resets both vitals to null; otherwise preserve current values
			const isEmptyUpdate = Object.keys(update).length === 0;
			const nextVitals = isEmptyUpdate
				? { heartRate: null, spO2: null }
				: {
						heartRate: update.heart_rate
				?? update.heartRate
				?? currentVitalsRef.current.heartRate,

			spO2: update.spo2
				?? update.spO2
				?? update.oxygenSaturation
				?? currentVitalsRef.current.spO2,
							};

			currentVitalsRef.current = nextVitals;
			setVitals(nextVitals);

			if (!isEmptyUpdate) {
    setVitalsData((previousData) => [
        ...previousData,
        {
            heartRate: nextVitals.heartRate,
            spO2: nextVitals.spO2,
            recordedAt: update.recorded_at ?? new Date().toISOString(),
        },
    ]);
}

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
				<Typography variant="body2" color="text.secondary">
                    Telemetry readings received: {vitalsData.length}
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

				<div className="telemetry-trends">
					<VitalTrend
						label="Heart rate"
						readings={vitalsData}
						field="heartRate"
						color="#d32f2f"
					/>
					<VitalTrend
						label="Oxygen saturation"
						readings={vitalsData}
						field="spO2"
						color="#1976d2"
					/>
				</div>

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


				VitalTrend.propTypes = {
					label: PropTypes.string.isRequired,
					readings: PropTypes.arrayOf(
						PropTypes.shape({
							heartRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
							spO2: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
						})
					).isRequired,
					field: PropTypes.oneOf(['heartRate', 'spO2']).isRequired,
					color: PropTypes.string.isRequired,
				};


export default LiveTelemetryCard;
