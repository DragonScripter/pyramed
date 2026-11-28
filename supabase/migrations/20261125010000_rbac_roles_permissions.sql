-- Ticket 23: canonical RBAC roles, permissions, and role mappings.

CREATE TABLE IF NOT EXISTS public.roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(role_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(permission_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- The backend uses the service role for these tables. Direct client access is not
-- granted so role mappings cannot be changed by bypassing the API.
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.roles FROM anon, authenticated;
REVOKE ALL ON public.permissions FROM anon, authenticated;
REVOKE ALL ON public.role_permissions FROM anon, authenticated;

INSERT INTO public.roles (name, description)
VALUES
    ('Clerk', 'Manages required patient information for operational workflows.'),
    ('Provider', 'Reviews patients and manages clinical records and rules.'),
    ('Analyst', 'Views operational and analytical information without changing clinical data.'),
    ('Administrator', 'Manages system configuration, access, and audit visibility.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.permissions (name, description)
VALUES
    ('patients.read', 'View patient information.'),
    ('patients.write', 'Create or update patient information.'),
    ('records.read', 'View clinical records.'),
    ('records.write', 'Create or update clinical records.'),
    ('rules.read', 'View clinical rules.'),
    ('rules.write', 'Create or update clinical rules.'),
    ('analytics.read', 'View operational and analytical information.'),
    ('audit.read', 'View audit log entries.'),
    ('roles.read', 'View roles and permission mappings.'),
    ('roles.write', 'Create roles and update permission mappings.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Normalize roles created by the previous PHYSICIAN/NURSE/ADMIN definition.
UPDATE public.profiles
SET role = CASE lower(role)
    WHEN 'physician' THEN 'Provider'
    WHEN 'nurse' THEN 'Provider'
    WHEN 'admin' THEN 'Administrator'
    WHEN 'administrator' THEN 'Administrator'
    WHEN 'analyst' THEN 'Analyst'
    WHEN 'clerk' THEN 'Clerk'
    WHEN 'provider' THEN 'Provider'
    ELSE 'Clerk'
END
WHERE role IS NULL
   OR lower(role) NOT IN ('clerk', 'provider', 'analyst', 'administrator');

ALTER TABLE public.profiles
    ALTER COLUMN role SET DEFAULT 'Clerk';

-- Keep profile roles referentially valid while still allowing future custom roles
-- created through the role-management API.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_role_fkey'
          AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_role_fkey
            FOREIGN KEY (role) REFERENCES public.roles(name);
    END IF;
END $$;

-- Seed the default role-to-permission policy using names, not generated UUIDs.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON (
    (r.name = 'Clerk' AND p.name IN ('patients.read', 'patients.write'))
 OR (r.name = 'Provider' AND p.name IN ('patients.read', 'records.read', 'records.write', 'rules.read'))
 OR (r.name = 'Analyst' AND p.name IN ('patients.read', 'analytics.read', 'audit.read'))
 OR (r.name = 'Administrator' AND p.name IN (
        'patients.read', 'patients.write', 'records.read', 'records.write',
        'rules.read', 'rules.write', 'analytics.read', 'audit.read',
        'roles.read', 'roles.write'
    ))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
