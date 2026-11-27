import './AccessLedger.css'

function AccessLedger() {
  return (
    <main className="access-ledger" aria-labelledby="access-ledger-title">
      <header className="access-ledger__header">
        <p className="access-ledger__eyebrow">Compliance review</p>
        <h1 id="access-ledger-title">Patient Access Ledger</h1>
        <p className="access-ledger__description">
          Review read-only records of staff access to patient information.
        </p>
      </header>

      <section
        className="access-ledger__filters"
        aria-labelledby="access-ledger-filters-title"
      >
        <h2 id="access-ledger-filters-title">Filter audit records</h2>
        <p>Filter controls will appear here.</p>
      </section>

      <section
        className="access-ledger__results"
        aria-labelledby="access-ledger-results-title"
      >
        <h2 id="access-ledger-results-title">Access records</h2>
        <p>Audit records are read-only and cannot be edited or deleted.</p>
      </section>
    </main>
  )
}

export default AccessLedger
