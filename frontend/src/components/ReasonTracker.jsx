import PropTypes from 'prop-types';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatAlertReason } from './alertEvidence';
import './ReasonTracker.css';

const severityDetails = {
  warning: { color: 'warning', label: 'Warning' },
  critical: { color: 'error', label: 'Critical' },
};

const getSeverityDetails = (severity) =>
  severityDetails[severity] ?? severityDetails.critical;

const ReasonTracker = ({ active = false, violations = [] }) => {
  const hasCriticalReason = violations.some(
    (violation) => getSeverityDetails(violation.severity).label === 'Critical',
  );
  const trackerSeverity = hasCriticalReason ? 'critical' : 'warning';
  const activeReasonCount = violations.length;
  const reasonLabel = activeReasonCount === 1 ? 'reason' : 'reasons';
  const reviewVerb = activeReasonCount === 1 ? 'requires' : 'require';

  return (
    <Card
      component="section"
      className={`reason-tracker${active ? ` reason-tracker--${trackerSeverity}` : ''}`}
      aria-labelledby="reason-tracker-title"
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Alert evidence
        </Typography>
        <Typography id="reason-tracker-title" variant="h5" component="h2">
          Reason tracker
        </Typography>

        {!active ? (
          <Typography className="reason-tracker__empty" role="status" aria-live="polite">
            No active alert reasons.
          </Typography>
        ) : (
          <>
            <Typography className="reason-tracker__status" role="status" aria-live="polite" aria-atomic="true">
              Active {trackerSeverity} alert evidence: {activeReasonCount} {reasonLabel} {reviewVerb} review.
            </Typography>
            <Stack component="ul" className="reason-tracker__list" spacing={1}>
              {violations.map((violation) => {
                const severity = getSeverityDetails(violation.severity);

                return (
                  <li
                    key={violation.metric}
                    className={`reason-tracker__item reason-tracker__item--${severity.label.toLowerCase()}`}
                  >
                    <Chip
                      className="reason-tracker__severity"
                      label={severity.label}
                      color={severity.color}
                      size="small"
                    />
                    <Typography component="span" className="reason-tracker__reason">
                      {formatAlertReason(violation)}
                    </Typography>
                  </li>
                );
              })}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

ReasonTracker.propTypes = {
  active: PropTypes.bool,
  violations: PropTypes.arrayOf(PropTypes.shape({
    metric: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    unit: PropTypes.string.isRequired,
    vitalName: PropTypes.string,
    threshold: PropTypes.number,
    comparison: PropTypes.oneOf(['above', 'below']),
    severity: PropTypes.oneOf(['critical', 'warning']),
  })),
};

export default ReasonTracker;
