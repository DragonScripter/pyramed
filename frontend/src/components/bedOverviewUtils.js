const statusOrder = ['Critical', 'Stable', 'No telemetry']

const compareValues = (left, right, key) => {
  if (left == null && right == null) return 0
  if (left == null) return 1
  if (right == null) return -1

  if (['alertFlagCount', 'heartRate', 'spo2'].includes(key)) {
    return Number(left) - Number(right)
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export const sortBedOverviewRows = (rows, sort) =>
  [...rows].sort((left, right) => {
    const comparison = compareValues(left[sort.key], right[sort.key], sort.key)
    return sort.direction === 'asc' ? comparison : -comparison
  })

export const groupBedOverviewRows = (rows, groupBy) => {
  if (groupBy === 'none') {
    return [{ label: 'All hospital beds', rows }]
  }

  const groups = rows.reduce((groupedRows, row) => {
    const label = row[groupBy] || 'Unknown'
    const group = groupedRows.get(label) ?? []
    group.push(row)
    groupedRows.set(label, group)
    return groupedRows
  }, new Map())

  return [...groups.entries()]
    .sort(([left], [right]) => {
      if (groupBy !== 'monitoringStatus') {
        return left.localeCompare(right)
      }

      return statusOrder.indexOf(left) - statusOrder.indexOf(right)
    })
    .map(([label, groupedRows]) => ({ label, rows: groupedRows }))
}
