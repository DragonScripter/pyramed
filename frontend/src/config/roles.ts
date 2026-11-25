// Canonical RBAC identifiers shared by the frontend and backend.
export const ROLES = Object.freeze({
  CLERK: 'Clerk',
  PROVIDER: 'Provider',
  ANALYST: 'Analyst',
  ADMINISTRATOR: 'Administrator',
});

// Permissions are intentionally small, explicit capabilities.
// Keep the dot notation stable because these values are persisted in the database.
export const PERMISSIONS = Object.freeze({
  PATIENTS_READ: 'patients.read',
  PATIENTS_WRITE: 'patients.write',
  RECORDS_READ: 'records.read',
  RECORDS_WRITE: 'records.write',
  RULES_READ: 'rules.read',
  RULES_WRITE: 'rules.write',
  ANALYTICS_READ: 'analytics.read',
  AUDIT_READ: 'audit.read',
  ROLES_READ: 'roles.read',
  ROLES_WRITE: 'roles.write',
});

// Human-readable metadata for the administrator interface.
export const ROLE_DEFINITIONS = Object.freeze({
  [ROLES.CLERK]: {
    label: 'Clerk',
    description: 'Manages required patient information for operational workflows.',
  },
  [ROLES.PROVIDER]: {
    label: 'Provider',
    description: 'Reviews patients and manages clinical records and rules.',
  },
  [ROLES.ANALYST]: {
    label: 'Analyst',
    description: 'Views operational and analytical information without changing clinical data.',
  },
  [ROLES.ADMINISTRATOR]: {
    label: 'Administrator',
    description: 'Manages system configuration, access, and audit visibility.',
  },
});

// Default policy used to seed and validate the role-to-permission mapping.
// The backend remains the security boundary; this map is also used for UI checks.
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.CLERK]: Object.freeze([
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
  ]),
  [ROLES.PROVIDER]: Object.freeze([
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.RECORDS_WRITE,
    PERMISSIONS.RULES_READ,
  ]),
  [ROLES.ANALYST]: Object.freeze([
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
  ]),
  [ROLES.ADMINISTRATOR]: Object.freeze([
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.RECORDS_WRITE,
    PERMISSIONS.RULES_READ,
    PERMISSIONS.RULES_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_WRITE,
  ]),
});

export const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS));
