import PropTypes from 'prop-types';
import './CriticalAlarmBanner.css';

const CriticalAlarmBanner = ({
	active = false,
	message = 'Critical vital sign detected. Immediate assessment required.',
}) => {
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
				<p className="critical-alarm-banner__message">{message}</p>
			</div>
		</section>
	);
};

CriticalAlarmBanner.propTypes = {
	active: PropTypes.bool,
	message: PropTypes.string,
};

export default CriticalAlarmBanner;
