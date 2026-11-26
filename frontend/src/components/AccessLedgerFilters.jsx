import { useState } from "react";
import "./AccessLedgerFilters.css";

const initialFilters = {
  userName: "",
  patientId: "",
  from: "",
  to: "",
};

export default function AccessLedgerFilters({ onApply }) {
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function handleApply(event) {
    event.preventDefault();

    if (
      filters.from &&
      filters.to &&
      new Date(filters.from) > new Date(filters.to)
    ) {
      setError("Start date must be before or equal to end date.");
      return;
    }

    setError("");

    onApply({
      userName: filters.userName.trim(),
      patientId: filters.patientId.trim(),
      from: filters.from
        ? new Date(filters.from).toISOString()
        : "",
      to: filters.to
        ? new Date(filters.to).toISOString()
        : "",
    });
  }

  function handleReset() {
    setFilters({ ...initialFilters });
    setError("");
    onApply({ ...initialFilters });
  }

  return (
    <section className="ledger-filters">
      <h2>Filter Audit Records</h2>

      <form onSubmit={handleApply}>
        <div className="ledger-filter-grid">
          <div className="ledger-filter-field">
            <label htmlFor="ledger-user-name">
              User Name
            </label>

            <input
              id="ledger-user-name"
              name="userName"
              type="text"
              placeholder="Enter user name"
              value={filters.userName}
              onChange={handleChange}
            />
          </div>

          <div className="ledger-filter-field">
            <label htmlFor="ledger-patient-id">
              Patient ID
            </label>

            <input
              id="ledger-patient-id"
              name="patientId"
              type="text"
              placeholder="Enter patient ID"
              value={filters.patientId}
              onChange={handleChange}
            />
          </div>

          <div className="ledger-filter-field">
            <label htmlFor="ledger-from">
              From Date and Time
            </label>

            <input
              id="ledger-from"
              name="from"
              type="datetime-local"
              value={filters.from}
              onChange={handleChange}
            />
          </div>

          <div className="ledger-filter-field">
            <label htmlFor="ledger-to">
              To Date and Time
            </label>

            <input
              id="ledger-to"
              name="to"
              type="datetime-local"
              value={filters.to}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && (
          <p className="ledger-filter-error" role="alert">
            {error}
          </p>
        )}

        <div className="ledger-filter-actions">
          <button
            type="button"
            className="ledger-reset-button"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="submit"
            className="ledger-apply-button"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </section>
  );
}