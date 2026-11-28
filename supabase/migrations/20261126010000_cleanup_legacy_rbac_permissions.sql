-- Ticket 23: remove legacy role-permission mappings left by the previous RBAC model.
-- This migration only normalizes the four standard roles. Custom roles and their
-- permissions are preserved.

DELETE FROM public.role_permissions rp
USING public.roles r, public.permissions p
WHERE rp.role_id = r.role_id
  AND rp.permission_id = p.permission_id
  AND (
      (r.name = 'Clerk' AND p.name NOT IN ('patients.read', 'patients.write'))
   OR (r.name = 'Provider' AND p.name NOT IN (
        'patients.read', 'records.read', 'records.write', 'rules.read'
      ))
   OR (r.name = 'Analyst' AND p.name NOT IN (
        'patients.read', 'analytics.read', 'audit.read'
      ))
   OR (r.name = 'Administrator' AND p.name NOT IN (
        'patients.read', 'patients.write', 'records.read', 'records.write',
        'rules.read', 'rules.write', 'analytics.read', 'audit.read',
        'roles.read', 'roles.write'
      ))
  );

-- Restore the canonical mappings if a previous manual cleanup removed one.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON (
    (r.name = 'Clerk' AND p.name IN ('patients.read', 'patients.write'))
 OR (r.name = 'Provider' AND p.name IN (
        'patients.read', 'records.read', 'records.write', 'rules.read'
    ))
 OR (r.name = 'Analyst' AND p.name IN (
        'patients.read', 'analytics.read', 'audit.read'
    ))
 OR (r.name = 'Administrator' AND p.name IN (
        'patients.read', 'patients.write', 'records.read', 'records.write',
        'rules.read', 'rules.write', 'analytics.read', 'audit.read',
        'roles.read', 'roles.write'
    ))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Remove obsolete permission definitions only when no role still references them.
DELETE FROM public.permissions p
WHERE p.name IN ('users.read', 'users.write', 'vitals.read', 'vitals.write')
  AND NOT EXISTS (
      SELECT 1
      FROM public.role_permissions rp
      WHERE rp.permission_id = p.permission_id
  );
