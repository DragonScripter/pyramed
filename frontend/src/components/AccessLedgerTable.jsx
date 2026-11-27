const sortableColumns = [
  { key: 'userName', label: 'User' },
  { key: 'patientId', label: 'Patient ID' },
  { key: 'timestamp', label: 'Timestamp (UTC)' },
]

const formatAction = (action) => {
  if (action === 0 || String(action).toLowerCase() === 'view') return 'View'
  if (action === 1 || String(action).toLowerCase() === 'edit') return 'Edit'
  return String(action ?? '--')
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) return timestamp || '--'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date)
}

function AccessLedgerTable({ entries, sort, onSort }) {
  const getSortState = (key) => {
    if (sort.key !== key) return 'none'
    return sort.direction === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <div className="access-ledger__table-scroll" tabIndex="0">
      <table className="access-ledger__table">
        <thead>
          <tr>
            {sortableColumns.slice(0, 1).map((column) => (
              <th key={column.key} aria-sort={getSortState(column.key)}>
                <button type="button" onClick={() => onSort(column.key)}>
                  {column.label}
                </button>
              </th>
            ))}
            <th scope="col">Role</th>
            {sortableColumns.slice(1, 2).map((column) => (
              <th key={column.key} aria-sort={getSortState(column.key)}>
                <button type="button" onClick={() => onSort(column.key)}>
                  {column.label}
                </button>
              </th>
            ))}
            <th scope="col">Action</th>
            {sortableColumns.slice(2).map((column) => (
              <th key={column.key} aria-sort={getSortState(column.key)}>
                <button type="button" onClick={() => onSort(column.key)}>
                  {column.label}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.userName || '--'}</td>
              <td>{entry.userRole || '--'}</td>
              <td className="access-ledger__patient-id">{entry.patientId || '--'}</td>
              <td>
                <span className="access-ledger__action">{formatAction(entry.action)}</span>
              </td>
              <td>{formatTimestamp(entry.timestampUtc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AccessLedgerTable
