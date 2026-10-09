import PropTypes from 'prop-types';
import './CriticalAlarmBanner.css';

const formatViolation = ({ metric, value, unit }) => {
	if (metric === 'SpO2') {
		return `SpO2: ${value}${unit} (below the 90% critical threshold)`;
	}

	if (metric === 'HR') {
		return `Heart rate: ${value} ${unit} (above the 120 bpm critical threshold)`;
	}

	return `${metric}: ${value} ${unit} (critical threshold exceeded)`;
};

const CriticalAlarmBanner = ({ active = false, violations = [] }) => {
	if (!active) {
		return null;
	}

	return (
		<section className="critical-alarm-banner" role="alert" aria-live="assertive">
			<span className="critical-alarm-banner__indicator" aria-hidden="true">
				!
			</span>
			<div>
				<p className="critical-alarm-banner__title">Critical vital alert</p>
				<ul className="critical-alarm-banner__violations">
					{violations.map(({ metric, value, unit }) => (
						<li key={metric}>{formatViolation({ metric, value, unit })}</li>
					))}
				</ul>
			</div>
		</section>
	);
};

CriticalAlarmBanner.propTypes = {
	active: PropTypes.bool,
	violations: PropTypes.arrayOf(PropTypes.shape({
		metric: PropTypes.string.isRequired,
		value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		unit: PropTypes.string.isRequired,
	})),
};

export default CriticalAlarmBanner;
