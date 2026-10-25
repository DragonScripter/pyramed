import { useState } from 'react';
import PropTypes from 'prop-types';
import './CdsInsightsSidebar.css';

function CdsInsightsSidebar({ evaluation = null }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Expected evaluation structure:
  // {
  //   riskScore: 75,
  //   riskLevel: "High",
  //   warnings: ["Example warning from backend"]
  // }

  const riskScore = evaluation?.riskScore;
  const riskLevel = evaluation?.riskLevel;
  const warnings = Array.isArray(evaluation?.warnings)
    ? evaluation.warnings
    : [];

  return (
    <aside
      className={`cds-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      aria-label="Clinical Decision Support Insights"
    >
      <div className="cds-sidebar__header">
        <h2>CDS Insights</h2>

        <button
          type="button"
          className="cds-sidebar__toggle"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
          aria-controls="cds-sidebar-content"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div id="cds-sidebar-content" className="cds-sidebar__content">
          {evaluation === null ? (
            <p className="cds-sidebar__empty">
              Awaiting clinical risk evaluation...
            </p>
          ) : (
            <>
              <div className="cds-sidebar__risk">
                <h3>Composite Risk Score</h3>
                <p className="cds-sidebar__score">
                  {riskScore ?? 'Not available'}
                </p>
                <p>
                  Risk level: <strong>{riskLevel ?? 'Unknown'}</strong>
                </p>
              </div>

              <div className="cds-sidebar__warnings" aria-live="polite">
                <h3>Clinical Warnings</h3>

                {warnings.length > 0 ? (
                  warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="cds-sidebar__warning"
                      role="alert"
                    >
                      {warning}
                    </div>
                  ))
                ) : (
                  <p>No warnings reported by the evaluation service.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}

CdsInsightsSidebar.propTypes = {
  evaluation: PropTypes.shape({
    riskScore: PropTypes.number,
    riskLevel: PropTypes.string,
    warnings: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default CdsInsightsSidebar;