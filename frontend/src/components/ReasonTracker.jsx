import PropTypes from 'prop-types';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatAlertReason } from './alertEvidence';
import './ReasonTracker.css';

const severityColor = (severity) => severity === 'warning' ? 'warning' : 'error';
const severityLabel = (severity) =>
  `${severity?.charAt(0).toUpperCase() ?? 'C'}${severity?.slice(1) ?? 'ritical'}`;

const ReasonTracker = ({ active = false, violations = [] }) => (
  <Card
    component="section"
    className={`reason-tracker${active ? ' reason-tracker--active' : ''}`}
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
        <Typography className="reason-tracker__empty" role="status">
          No active alert reasons.
        </Typography>
      ) : (
        <Stack component="ul" className="reason-tracker__list" spacing={1}>
          {violations.map((violation) => (
            <li key={violation.metric} className="reason-tracker__item">
              <Chip
                label={severityLabel(violation.severity)}
                color={severityColor(violation.severity)}
                size="small"
              />
              <Typography component="span" className="reason-tracker__reason">
                {formatAlertReason(violation)}
              </Typography>
            </li>
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

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
