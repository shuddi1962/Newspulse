-- Phase 1 · Step 3 follow-up
-- The on_auth_user_created trigger only fires on new INSERTs, so any
-- auth.users rows that existed before 0001_phase1_foundation.sql ran do
-- not have a matching public.profiles row yet. This backfill is idempotent
-- via WHERE NOT EXISTS — re-running it is a safe no-op.

INSERT INTO public.profiles (id, display_name, role)
SELECT
  u.id,
  COALESCE(
    NULLIF(trim(COALESCE(u.profile ->> 'name', u.metadata ->> 'name', '')), ''),
    split_part(u.email, '@', 1),
    'User'
  ),
  CASE
    WHEN u.is_project_admin THEN 'admin'::public.user_role
    ELSE 'reader'::public.user_role
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
