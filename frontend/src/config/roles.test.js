import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from './roles'
import { hasPermission } from '../utils/auth'

describe('role permission mapping', () => {
  it('defines the four required system roles', () => {
    expect(Object.values(ROLES)).toEqual([
      'Clerk',
      'Provider',
      'Analyst',
      'Administrator',
    ])
  })

  it('uses explicit dot-notation permission identifiers', () => {
    expect(Object.values(PERMISSIONS)).toEqual([
      'patients.read',
      'patients.write',
      'records.read',
      'records.write',
      'rules.read',
      'rules.write',
      'analytics.read',
      'audit.read',
      'roles.read',
      'roles.write',
    ])
  })

  it('gives clerks only the patient permissions needed for operations', () => {
    expect(ROLE_PERMISSIONS[ROLES.CLERK]).toEqual([
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.PATIENTS_WRITE,
    ])
    expect(hasPermission(ROLES.CLERK, PERMISSIONS.RECORDS_WRITE)).toBe(false)
  })

  it('gives providers clinical record permissions without administration access', () => {
    expect(ROLE_PERMISSIONS[ROLES.PROVIDER]).toEqual([
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.RECORDS_READ,
      PERMISSIONS.RECORDS_WRITE,
      PERMISSIONS.RULES_READ,
    ])
    expect(hasPermission(ROLES.PROVIDER, PERMISSIONS.ROLES_WRITE)).toBe(false)
  })

  it('gives analysts read-only analytical and audit access', () => {
    expect(ROLE_PERMISSIONS[ROLES.ANALYST]).toEqual([
      PERMISSIONS.PATIENTS_READ,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.AUDIT_READ,
    ])
    expect(hasPermission(ROLES.ANALYST, PERMISSIONS.PATIENTS_WRITE)).toBe(false)
  })

  it('gives administrators explicit access-management permissions', () => {
    expect(hasPermission(ROLES.ADMINISTRATOR, PERMISSIONS.ROLES_READ)).toBe(true)
    expect(hasPermission(ROLES.ADMINISTRATOR, PERMISSIONS.ROLES_WRITE)).toBe(true)
    expect(hasPermission(ROLES.ADMINISTRATOR, PERMISSIONS.RULES_WRITE)).toBe(true)
  })
})
