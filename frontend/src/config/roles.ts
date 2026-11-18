// System role identifiers
export const ROLES = {
  PHYSICIAN: 'PHYSICIAN',
  NURSE: 'NURSE',
  ADMIN: 'ADMIN',
};

// Smallest permission units used by feature-level authorization checks.
export const PERMISSIONS = {
  READ_PATIENTS: 'patients:read',
  MONITOR_TELEMETRY: 'telemetry:monitor',
  READ_ALARMS: 'alarms:read',
  RESPOND_TO_ALARMS: 'alarms:respond',
  WRITE_CLINICAL_RECORDS: 'records:write',
  READ_ANALYTICS: 'analytics:read',
  READ_AUDIT: 'audit:read',
  MANAGE_ADMINISTRATION: 'admin:manage',
};

// Central role-to-permission policy. Each role receives only permissions
// required by its Ticket 23 responsibilities.
export const ROLE_PERMISSIONS = {
  [ROLES.PHYSICIAN]: [
    PERMISSIONS.READ_PATIENTS,
    PERMISSIONS.MONITOR_TELEMETRY,
    PERMISSIONS.READ_ALARMS,
    PERMISSIONS.WRITE_CLINICAL_RECORDS,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.MONITOR_TELEMETRY,
    PERMISSIONS.READ_ALARMS,
    PERMISSIONS.RESPOND_TO_ALARMS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_AUDIT,
    PERMISSIONS.MANAGE_ADMINISTRATION,
  ],
};
