-- Ticket 27: Add active status to user profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Improve performance when filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active
ON public.profiles (is_active);