import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { groupBedOverviewRows, sortBedOverviewRows } from './bedOverviewUtils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const REFRESH_INTERVAL_MS = 15_000

const columns = [
  { key: 'bedLabel', label: 'Bed' },
  { key: 'patientName', label: 'Patient' },
  { key: 'admissionStatus', label: 'Admission' },
  { key: 'monitoringStatus', label: 'Monitoring' },
  { key: 'alertFlagCount', label: 'Alerts' },
  { key: 'heartRate', label: 'Heart rate' },
  { key: 'spo2', label: 'SpO2' },
  { key: 'recordedAt', label: 'Last reading' },
]

const formatReadingTime = (recordedAt) => {
  if (!recordedAt) return '--'

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(recordedAt))
}

const statusClassName = (status) =>
  `clinical-analyst-terminal__status clinical-analyst-terminal__status--${status
    .toLowerCase()
    .replaceAll(' ', '-')}`

function BedOverviewTable({ refreshIntervalMs = REFRESH_INTERVAL_MS }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ key: 'patientName', direction: 'asc' })
  const [groupBy, setGroupBy] = useState('monitoringStatus')

  useEffect(() => {
    const controller = new AbortController()

    const loadBedOverview = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/operations/bed-overview`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Bed overview request failed.')
        }

        const payload = await response.json()
        setRows(Array.isArray(payload?.beds) ? payload.beds : [])
        setError(null)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Hospital bed overview is temporarily unavailable.')
        }
      }
    }

    void loadBedOverview()
    const refreshId = window.setInterval(loadBedOverview, refreshIntervalMs)

    return () => {
      controller.abort()
      window.clearInterval(refreshId)
    }
  }, [refreshIntervalMs])

  const groupedRows = useMemo(
    () => groupBedOverviewRows(sortBedOverviewRows(rows, sort), groupBy),
    [groupBy, rows, sort],
  )

  const handleSort = (key) => {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <>
      <div className="clinical-analyst-terminal__table-toolbar">
        <label>
          Group rows by
          <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
            <option value="monitoringStatus">Monitoring status</option>
            <option value="admissionStatus">Admission status</option>
            <option value="none">No grouping</option>
          </select>
        </label>
        <p role="status">
          {error ?? (rows.length ? `${rows.length} hospital bed records loaded.` : 'Loading hospital bed records...')}
        </p>
      </div>

      <div className="clinical-analyst-terminal__table-scroll" tabIndex="0">
        <table className="clinical-analyst-terminal__table">
          <thead>
            <tr>
              {columns.map((column) => {
                const isSorted = sort.key === column.key
                const direction = isSorted ? sort.direction : 'none'

                return (
                  <th key={column.key} aria-sort={direction === 'none' ? 'none' : direction === 'asc' ? 'ascending' : 'descending'}>
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      aria-label={`${column.label}, sort ${isSorted ? direction : 'ascending'}`}
                    >
                      {column.label}
                      <span aria-hidden="true">{isSorted ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {groupedRows.flatMap((group) => [
              groupBy !== 'none' && (
                <tr className="clinical-analyst-terminal__group-row" key={`group-${group.label}`}>
                  <th colSpan={columns.length} scope="rowgroup">
                    {group.label} ({group.rows.length})
                  </th>
                </tr>
              ),
              ...group.rows.map((row) => (
                <tr key={row.patientId}>
                  <td>{row.bedLabel}</td>
                  <td>{row.patientName}</td>
                  <td>{row.admissionStatus}</td>
                  <td>
                    <span className={statusClassName(row.monitoringStatus)}>
                      {row.monitoringStatus}
                    </span>
                  </td>
                  <td>{row.alertFlagCount}</td>
                  <td>{row.heartRate ?? '--'}</td>
                  <td>{row.spo2 ?? '--'}</td>
                  <td>{formatReadingTime(row.recordedAt)}</td>
                </tr>
              )),
            ])}
            {!error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>No hospital bed records are available.</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={columns.length}>{error}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

BedOverviewTable.propTypes = {
  refreshIntervalMs: PropTypes.number,
}

export default BedOverviewTable
