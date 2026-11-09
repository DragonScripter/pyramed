import './ClinicalAnalystTerminal.css'
import BedOverviewTable from './BedOverviewTable'
import OperationsMetricsPanel from './OperationsMetricsPanel'

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
        <OperationsMetricsPanel />
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
          <p>Sort columns or group rows to review operational state.</p>
        </div>

        <BedOverviewTable />
      </section>
    </main>
  )
}

export default ClinicalAnalystTerminal
