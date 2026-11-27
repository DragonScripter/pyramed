import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api'
import AccessLedgerFilters from '../components/AccessLedgerFilters'
import AccessLedgerStates from '../components/AccessLedgerStates'
import AccessLedgerTable from '../components/AccessLedgerTable'
import './AccessLedger.css'

const defaultFilters = {
  userName: '',
  patientId: '',
  from: '',
  to: '',
}

const PAGE_SIZE = 25

function AccessLedger() {
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'timestamp', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryToken, setRetryToken] = useState(0)
  const [filtersKey, setFiltersKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const loadLedger = async () => {
      setLoading(true)
      setError(null)

      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sortBy: sort.key,
        sortDir: sort.direction,
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.set(key, value)
      })

      try {
        const response = await apiFetch(`/api/auditlog?${query}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Audit ledger request failed with status ${response.status}.`)
        }

        const payload = await response.json()
        setResult({
          items: Array.isArray(payload?.items) ? payload.items : [],
          total: Number.isFinite(payload?.total) ? payload.total : 0,
          page: payload?.page ?? page,
          pageSize: payload?.pageSize ?? PAGE_SIZE,
        })
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadLedger()
    return () => controller.abort()
  }, [filters, page, retryToken, sort])

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))
  const hasFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters],
  )

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    setPage(1)
    setFiltersKey((current) => current + 1)
  }

  const handleSort = (key) => {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  return (
    <main className="access-ledger" aria-labelledby="access-ledger-title">
      <header className="access-ledger__header">
        <p className="access-ledger__eyebrow">Compliance review</p>
        <h1 id="access-ledger-title">Patient Access Ledger</h1>
        <p className="access-ledger__description">
          Review read-only records of staff access to patient information.
        </p>
      </header>

      <AccessLedgerFilters key={filtersKey} onApply={handleApplyFilters} />

      <section
        className="access-ledger__results"
        aria-labelledby="access-ledger-results-title"
      >
        <h2 id="access-ledger-results-title">Access records</h2>
        <p className="access-ledger__read-only-note">
          Audit records are read-only and cannot be edited or deleted.
        </p>

        {!loading && !error && result.items.length > 0 && (
          <>
            <p className="access-ledger__result-count" role="status">
              {result.total} record{result.total === 1 ? '' : 's'} found.
            </p>
            <AccessLedgerTable
              entries={result.items}
              sort={sort}
              onSort={handleSort}
            />
            <nav className="access-ledger__pagination" aria-label="Access ledger pages">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={result.page <= 1}
              >
                Previous
              </button>
              <span>
                Page {result.page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={result.page >= totalPages}
              >
                Next
              </button>
            </nav>
          </>
        )}

        <AccessLedgerStates
          loading={loading}
          error={error}
          isEmpty={!loading && !error && result.items.length === 0}
          hasFilters={hasFilters}
          onRetry={() => setRetryToken((current) => current + 1)}
          onReset={handleClearFilters}
        />
      </section>
    </main>
  )
}

export default AccessLedger
