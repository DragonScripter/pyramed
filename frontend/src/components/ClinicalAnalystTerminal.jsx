import './ClinicalAnalystTerminal.css'

function ClinicalAnalystTerminal() {
  return (
    <main
      className="clinical-analyst-terminal"
      aria-labelledby="clinical-analyst-terminal-title"
    >
      <header className="clinical-analyst-terminal__header">
        <p className="clinical-analyst-terminal__eyebrow">Operations review</p>
        <h1 id="clinical-analyst-terminal-title">
          Clinical Analyst Administration Terminal
        </h1>
        <p className="clinical-analyst-terminal__description">
          Review system-wide operational activity across simulated hospital beds.
        </p>
      </header>

      <section
        className="clinical-analyst-terminal__metrics-panel"
        aria-labelledby="operations-metrics-title"
      >
        <div className="clinical-analyst-terminal__section-heading">
          <div>
            <p className="clinical-analyst-terminal__section-label">Snapshot</p>
            <h2 id="operations-metrics-title">Operations metrics</h2>
          </div>
          <p>Live counters will appear here.</p>
        </div>

        <div className="clinical-analyst-terminal__metrics-grid">
          <article className="clinical-analyst-terminal__metric-card">
            <h3>Active patients</h3>
            <p>Awaiting operational data</p>
          </article>
          <article className="clinical-analyst-terminal__metric-card">
            <h3>Alerts in the last hour</h3>
            <p>Awaiting operational data</p>
          </article>
          <article className="clinical-analyst-terminal__metric-card">
            <h3>Response stability</h3>
            <p>Awaiting operational data</p>
          </article>
        </div>
      </section>

      <section
        className="clinical-analyst-terminal__table-panel"
        aria-labelledby="hospital-bed-overview-title"
      >
        <div className="clinical-analyst-terminal__section-heading">
          <div>
            <p className="clinical-analyst-terminal__section-label">Bed census</p>
            <h2 id="hospital-bed-overview-title">Hospital bed overview</h2>
          </div>
          <p>Sortable bed records will appear here.</p>
        </div>

        <div className="clinical-analyst-terminal__table-canvas">
          <p>Operational bed data is not connected yet.</p>
        </div>
      </section>
    </main>
  )
}

export default ClinicalAnalystTerminal
