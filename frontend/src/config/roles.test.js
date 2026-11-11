import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from './roles'
import { hasPermission } from '../utils/auth'

describe('role permission mapping', () => {
  it('grants physicians access to clinical review and record entry only', () => {
    expect(ROLE_PERMISSIONS[ROLES.PHYSICIAN]).toEqual([
      PERMISSIONS.READ_PATIENTS,
      PERMISSIONS.MONITOR_TELEMETRY,
      PERMISSIONS.READ_ALARMS,
      PERMISSIONS.WRITE_CLINICAL_RECORDS,
    ])
    expect(hasPermission(ROLES.PHYSICIAN, PERMISSIONS.READ_ANALYTICS)).toBe(false)
  })

  it('grants nurses telemetry monitoring and critical alarm response only', () => {
    expect(ROLE_PERMISSIONS[ROLES.NURSE]).toEqual([
      PERMISSIONS.MONITOR_TELEMETRY,
      PERMISSIONS.READ_ALARMS,
      PERMISSIONS.RESPOND_TO_ALARMS,
    ])
    expect(hasPermission(ROLES.NURSE, PERMISSIONS.READ_PATIENTS)).toBe(false)
  })

  it('grants administrators analytical, audit, and role management access only', () => {
    expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toEqual([
      PERMISSIONS.READ_ANALYTICS,
      PERMISSIONS.READ_AUDIT,
      PERMISSIONS.MANAGE_ADMINISTRATION,
    ])
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.MONITOR_TELEMETRY)).toBe(false)
  })
})
