import { describe, expect, it } from 'vitest'
import { groupBedOverviewRows, sortBedOverviewRows } from './bedOverviewUtils'

const rows = [
  { patientName: 'Mina', monitoringStatus: 'Stable', heartRate: 78 },
  { patientName: 'Avery', monitoringStatus: 'Critical', heartRate: 130 },
  { patientName: 'Drew', monitoringStatus: 'No telemetry', heartRate: null },
]

describe('bed overview utilities', () => {
  it('sorts numerical vital values while placing missing readings last', () => {
    const sortedRows = sortBedOverviewRows(rows, { key: 'heartRate', direction: 'asc' })

    expect(sortedRows.map((row) => row.patientName)).toEqual(['Mina', 'Avery', 'Drew'])
  })

  it('groups monitoring rows in critical, stable, and no telemetry order', () => {
    const groups = groupBedOverviewRows(rows, 'monitoringStatus')

    expect(groups.map((group) => group.label)).toEqual([
      'Critical',
      'Stable',
      'No telemetry',
    ])
  })
})
