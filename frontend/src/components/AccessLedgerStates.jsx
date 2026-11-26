import "./AccessLedgerStates.css";

export default function AccessLedgerStates({
  loading = false,
  error = null,
  isEmpty = false,
  hasFilters = false,
  onRetry,
  onReset,
}) {
  if (loading) {
    return (
      <div className="ledger-state" role="status">
        <p>Loading audit records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ledger-state ledger-error-state" role="alert">
        <h3>Unable to Load Audit Records</h3>

        <p>
          An error occurred while retrieving the patient access
          ledger. Please try again.
        </p>

        {onRetry && (
          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="ledger-state ledger-empty-state" role="status">
        <h3>
          {hasFilters
            ? "No Matching Audit Records"
            : "No Audit Records Available"}
        </h3>

        <p>
          {hasFilters
            ? "Try adjusting or clearing your filter criteria."
            : "There are currently no patient access records to display."}
        </p>

        {hasFilters && onReset && (
          <button type="button" onClick={onReset}>
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return null;
}