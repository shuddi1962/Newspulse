-- Phase 1 · Step 5 — admin management helpers
-- 1. Strengthens tg_profiles_guard_role so InsForge project admins (flagged
--    via auth.users.is_project_admin) also pass the role-change check,
--    not just users who happen to have role='admin' in profiles.
-- 2. Adds public.admin_list_users(), a SECURITY DEFINER RPC that joins
--    public.profiles with auth.users (which is not otherwise reachable
--    through PostgREST). The function itself re-verifies the caller is an
--    admin, so exposure through PostgREST is safe.

-------------------------------------------------------------------------------
-- 1. Strengthen role guard — admin OR project admin may change roles
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_profiles_guard_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_actor_admin BOOLEAN;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    SELECT
      COALESCE(
        (SELECT p.role = 'admin' FROM public.profiles p WHERE p.id = auth.uid()),
        false
      )
      OR COALESCE(
        (SELECT u.is_project_admin FROM auth.users u WHERE u.id = auth.uid()),
        false
      )
    INTO is_actor_admin;

    IF NOT is_actor_admin THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-------------------------------------------------------------------------------
-- 2. admin_list_users() RPC — admin-only user directory
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id               UUID,
  email            TEXT,
  email_verified   BOOLEAN,
  display_name     TEXT,
  username         TEXT,
  role             public.user_role,
  avatar_url       TEXT,
  bio              TEXT,
  website_url      TEXT,
  is_project_admin BOOLEAN,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin role required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(u.email_verified, false),
    p.display_name,
    p.username,
    p.role,
    p.avatar_url,
    p.bio,
    p.website_url,
    u.is_project_admin,
    p.created_at,
    p.updated_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY p.created_at DESC NULLS LAST, u.created_at DESC NULLS LAST;
END;
$$;
