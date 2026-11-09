import './BodyCompositionDashboard.css'

function BodyCompositionDashboard() {
  return (
    <main
      className="body-composition-dashboard"
      aria-labelledby="body-composition-dashboard-title"
    >
      <header className="body-composition-dashboard__header">
        <p className="body-composition-dashboard__eyebrow">Clinical analysis</p>
        <h1 id="body-composition-dashboard-title">Body Composition Dashboard</h1>
        <p className="body-composition-dashboard__description">
          Review body composition trends and summary metrics for a selected patient.
        </p>
      </header>

      <section
        className="body-composition-dashboard__filters"
        aria-labelledby="body-composition-filters-title"
      >
        <h2 id="body-composition-filters-title">Analysis filters</h2>
        <div className="body-composition-dashboard__filter-grid">
          <label className="body-composition-dashboard__field" htmlFor="body-composition-patient">
            <span>Patient</span>
            <select id="body-composition-patient" disabled>
              <option>Select a patient</option>
            </select>
          </label>

          <label className="body-composition-dashboard__field" htmlFor="body-composition-time-range">
            <span>Time range</span>
            <select id="body-composition-time-range" defaultValue="30d" disabled>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </label>
        </div>
        <p className="body-composition-dashboard__filter-hint">
          Patient data and filter interactions will be connected in the next step.
        </p>
      </section>

      <section
        className="body-composition-dashboard__content"
        aria-label="Body composition analysis results"
      >
        <section
          className="body-composition-dashboard__summary-panel"
          aria-labelledby="body-composition-summary-title"
        >
          <p className="body-composition-dashboard__section-label">Summary</p>
          <h2 id="body-composition-summary-title">Composition overview</h2>
          <p>Summary metric cards will appear here.</p>
        </section>

        <section
          className="body-composition-dashboard__trend-panel"
          aria-labelledby="body-composition-trends-title"
        >
          <p className="body-composition-dashboard__section-label">Trends</p>
          <h2 id="body-composition-trends-title">Body composition trends</h2>
          <div className="body-composition-dashboard__chart-placeholder">
            Trend chart will appear here.
          </div>
        </section>
      </section>
    </main>
  )
}

export default BodyCompositionDashboard
