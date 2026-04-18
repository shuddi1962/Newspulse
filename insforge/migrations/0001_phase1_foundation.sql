-- Phase 1 · Foundation schema
-- Creates: enums, profiles, organizations, organization_members, categories,
-- tags, media_assets, audit_log. Adds updated_at triggers, a profile auto-
-- provision trigger on auth.users, SECURITY DEFINER helpers used inside RLS
-- policies (to avoid recursive self-reference), and RLS policies that keep
-- public reads open while restricting writes by ownership or admin role.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('reader', 'author', 'editor', 'admin');

CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');

CREATE TYPE public.category_kind AS ENUM (
  'news', 'directory', 'jobs', 'marketplace',
  'events', 'real_estate', 'classifieds'
);

-------------------------------------------------------------------------------
-- 2. Shared trigger function — sets updated_at on row updates
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-------------------------------------------------------------------------------
-- 3. profiles  (1:1 with auth.users)
-------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  username      TEXT,
  role          public.user_role NOT NULL DEFAULT 'reader',
  bio           TEXT,
  avatar_url    TEXT,
  website_url   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 80),
  CONSTRAINT profiles_username_format CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,32}$')
);

CREATE UNIQUE INDEX profiles_username_unique ON public.profiles (lower(username)) WHERE username IS NOT NULL;
CREATE INDEX profiles_role_idx ON public.profiles (role);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Prevent self-promotion: non-admins cannot change their own role.
CREATE OR REPLACE FUNCTION public.tg_profiles_guard_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role public.user_role;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    SELECT p.role INTO actor_role FROM public.profiles p WHERE p.id = auth.uid();
    IF actor_role IS DISTINCT FROM 'admin' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_guard_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_guard_role();

-------------------------------------------------------------------------------
-- 4. organizations
-------------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  website_url   TEXT,
  logo_url      TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT organizations_name_length CHECK (char_length(name) BETWEEN 1 AND 120)
);

CREATE UNIQUE INDEX organizations_slug_unique ON public.organizations (slug);
CREATE INDEX organizations_owner_id_idx ON public.organizations (owner_id);
CREATE INDEX organizations_is_verified_idx ON public.organizations (is_verified);

CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. organization_members
-------------------------------------------------------------------------------
CREATE TABLE public.organization_members (
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             public.org_role NOT NULL DEFAULT 'member',
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX organization_members_role_idx ON public.organization_members (organization_id, role);

-- Auto-insert the creator as the owning member on organization INSERT.
CREATE OR REPLACE FUNCTION public.tg_organizations_add_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_add_owner
AFTER INSERT ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.tg_organizations_add_owner();

-------------------------------------------------------------------------------
-- 6. categories
-------------------------------------------------------------------------------
CREATE TABLE public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          public.category_kind NOT NULL,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  parent_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 80)
);

CREATE UNIQUE INDEX categories_kind_slug_unique ON public.categories (kind, slug);
CREATE INDEX categories_parent_id_idx ON public.categories (parent_id);
CREATE INDEX categories_kind_sort_idx ON public.categories (kind, sort_order);

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 7. tags
-------------------------------------------------------------------------------
CREATE TABLE public.tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  color         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tags_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT tags_name_length CHECK (char_length(name) BETWEEN 1 AND 50),
  CONSTRAINT tags_color_format CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$')
);

CREATE UNIQUE INDEX tags_slug_unique ON public.tags (slug);

-------------------------------------------------------------------------------
-- 8. media_assets
-------------------------------------------------------------------------------
CREATE TABLE public.media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bucket        TEXT NOT NULL,
  object_key    TEXT NOT NULL,
  url           TEXT NOT NULL,
  mime_type     TEXT,
  size_bytes    BIGINT,
  width         INTEGER,
  height        INTEGER,
  alt_text      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_size_nonneg CHECK (size_bytes IS NULL OR size_bytes >= 0),
  CONSTRAINT media_assets_width_nonneg CHECK (width IS NULL OR width >= 0),
  CONSTRAINT media_assets_height_nonneg CHECK (height IS NULL OR height >= 0)
);

CREATE UNIQUE INDEX media_assets_bucket_key_unique ON public.media_assets (bucket, object_key);
CREATE INDEX media_assets_uploader_id_idx ON public.media_assets (uploader_id);
CREATE INDEX media_assets_created_at_idx ON public.media_assets (created_at DESC);

-------------------------------------------------------------------------------
-- 9. audit_log
-------------------------------------------------------------------------------
CREATE TABLE public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  target_table  TEXT,
  target_id     UUID,
  diff          JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_action_length CHECK (char_length(action) BETWEEN 1 AND 120)
);

CREATE INDEX audit_log_actor_id_idx ON public.audit_log (actor_id);
CREATE INDEX audit_log_target_idx ON public.audit_log (target_table, target_id);
CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);

-------------------------------------------------------------------------------
-- 10. Authorization helpers (SECURITY DEFINER — safe inside RLS policies)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid() AND u.is_project_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(org UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  );
$$;

-------------------------------------------------------------------------------
-- 11. handle_new_user — auto-create a profiles row on auth.users INSERT
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fallback_name TEXT;
  provided_name TEXT;
BEGIN
  fallback_name := split_part(NEW.email, '@', 1);
  provided_name := NULLIF(trim(COALESCE(NEW.profile ->> 'name', NEW.metadata ->> 'name', '')), '');

  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(provided_name, fallback_name, 'User'),
    CASE WHEN NEW.is_project_admin THEN 'admin'::public.user_role ELSE 'reader'::public.user_role END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-------------------------------------------------------------------------------
-- 12. Enable RLS on every public table
-------------------------------------------------------------------------------
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log             ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 13. Policies — profiles
-------------------------------------------------------------------------------
CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 14. Policies — organizations
-------------------------------------------------------------------------------
CREATE POLICY organizations_select_public ON public.organizations
  FOR SELECT USING (true);

CREATE POLICY organizations_insert_authenticated ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY organizations_update_owner_or_admin ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY organizations_delete_owner_or_admin ON public.organizations
  FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 15. Policies — organization_members
-------------------------------------------------------------------------------
CREATE POLICY org_members_select_self_or_member ON public.organization_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_org_member(organization_id)
    OR public.is_admin()
  );

CREATE POLICY org_members_insert_org_admin ON public.organization_members
  FOR INSERT WITH CHECK (
    public.is_org_admin(organization_id) OR public.is_admin()
  );

CREATE POLICY org_members_update_org_admin ON public.organization_members
  FOR UPDATE USING (public.is_org_admin(organization_id) OR public.is_admin())
  WITH CHECK (public.is_org_admin(organization_id) OR public.is_admin());

CREATE POLICY org_members_delete_self_or_admin ON public.organization_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR public.is_org_admin(organization_id)
    OR public.is_admin()
  );

-------------------------------------------------------------------------------
-- 16. Policies — categories / tags  (read public, write admin-only)
-------------------------------------------------------------------------------
CREATE POLICY categories_select_public ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_insert_admin  ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY categories_update_admin  ON public.categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY categories_delete_admin  ON public.categories FOR DELETE USING (public.is_admin());

CREATE POLICY tags_select_public ON public.tags FOR SELECT USING (true);
CREATE POLICY tags_insert_admin  ON public.tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY tags_update_admin  ON public.tags FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY tags_delete_admin  ON public.tags FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 17. Policies — media_assets
-------------------------------------------------------------------------------
CREATE POLICY media_assets_select_public ON public.media_assets FOR SELECT USING (true);

CREATE POLICY media_assets_insert_self ON public.media_assets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND uploader_id = auth.uid());

CREATE POLICY media_assets_update_owner_or_admin ON public.media_assets
  FOR UPDATE USING (uploader_id = auth.uid() OR public.is_admin())
  WITH CHECK (uploader_id = auth.uid() OR public.is_admin());

CREATE POLICY media_assets_delete_owner_or_admin ON public.media_assets
  FOR DELETE USING (uploader_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 18. Policies — audit_log (append-only, admin-read, actor-self-insert)
-------------------------------------------------------------------------------
CREATE POLICY audit_log_select_admin ON public.audit_log FOR SELECT USING (public.is_admin());

CREATE POLICY audit_log_insert_self ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND actor_id = auth.uid());
