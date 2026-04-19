-- Phase 1 · Full schema rollout — 2 of 12: content (news CMS)
-- Tables: articles, article_tags, article_revisions, videos, comments,
--         polls, poll_votes, rss_internal_feeds, rss_external_sources.
-- RLS:    public reads published content; authors own their drafts;
--         editors review/publish/archive; admins moderate.

-------------------------------------------------------------------------------
-- 1. articles
-------------------------------------------------------------------------------
CREATE TABLE public.articles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  slug               TEXT NOT NULL,
  excerpt            TEXT,
  content_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_html       TEXT,
  featured_image     TEXT,
  gallery_images     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  author_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id        UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags               TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status             public.article_status NOT NULL DEFAULT 'draft',
  publish_at         TIMESTAMPTZ,
  is_breaking        BOOLEAN NOT NULL DEFAULT false,
  is_featured        BOOLEAN NOT NULL DEFAULT false,
  is_premium         BOOLEAN NOT NULL DEFAULT false,
  reading_time_min   INTEGER,
  word_count         INTEGER,
  seo_title          TEXT,
  seo_description    TEXT,
  seo_keywords       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  og_image           TEXT,
  canonical_url      TEXT,
  schema_json        JSONB,
  language           TEXT NOT NULL DEFAULT 'en',
  allow_comments     BOOLEAN NOT NULL DEFAULT true,
  view_count         BIGINT NOT NULL DEFAULT 0,
  share_count        BIGINT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT articles_title_length     CHECK (char_length(title) BETWEEN 1 AND 280),
  CONSTRAINT articles_slug_format      CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT articles_language_format  CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT articles_reading_time_nn  CHECK (reading_time_min IS NULL OR reading_time_min >= 0),
  CONSTRAINT articles_word_count_nn    CHECK (word_count IS NULL OR word_count >= 0),
  CONSTRAINT articles_view_count_nn    CHECK (view_count >= 0),
  CONSTRAINT articles_share_count_nn   CHECK (share_count >= 0),
  CONSTRAINT articles_publish_at_req   CHECK (
    status <> 'scheduled' OR publish_at IS NOT NULL
  )
);

CREATE UNIQUE INDEX articles_slug_unique        ON public.articles (slug);
CREATE INDEX articles_status_idx                ON public.articles (status);
CREATE INDEX articles_author_id_idx             ON public.articles (author_id);
CREATE INDEX articles_category_id_idx           ON public.articles (category_id);
CREATE INDEX articles_publish_at_idx            ON public.articles (publish_at DESC);
CREATE INDEX articles_published_list_idx        ON public.articles (status, publish_at DESC) WHERE status = 'published';
CREATE INDEX articles_is_featured_published_idx ON public.articles (is_featured, publish_at DESC) WHERE status = 'published' AND is_featured = true;
CREATE INDEX articles_is_breaking_idx           ON public.articles (is_breaking, publish_at DESC) WHERE is_breaking = true;
CREATE INDEX articles_tags_gin                  ON public.articles USING GIN (tags);

CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 2. article_tags  (normalised M2M to public.tags)
-------------------------------------------------------------------------------
CREATE TABLE public.article_tags (
  article_id   UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id       UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX article_tags_tag_id_idx ON public.article_tags (tag_id);

-------------------------------------------------------------------------------
-- 3. article_revisions  (append-only history)
-------------------------------------------------------------------------------
CREATE TABLE public.article_revisions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id     UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  content_json   JSONB NOT NULL,
  revised_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revision_note  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX article_revisions_article_idx ON public.article_revisions (article_id, created_at DESC);

-------------------------------------------------------------------------------
-- 4. videos
-------------------------------------------------------------------------------
CREATE TABLE public.videos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  slug               TEXT NOT NULL,
  description        TEXT,
  video_url          TEXT NOT NULL,
  thumbnail_url      TEXT,
  duration_seconds   INTEGER,
  author_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id        UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags               TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status             public.article_status NOT NULL DEFAULT 'draft',
  is_featured        BOOLEAN NOT NULL DEFAULT false,
  view_count         BIGINT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT videos_title_length CHECK (char_length(title) BETWEEN 1 AND 280),
  CONSTRAINT videos_slug_format  CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT videos_duration_nn  CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  CONSTRAINT videos_view_count_nn CHECK (view_count >= 0)
);

CREATE UNIQUE INDEX videos_slug_unique ON public.videos (slug);
CREATE INDEX videos_status_idx        ON public.videos (status);
CREATE INDEX videos_author_id_idx     ON public.videos (author_id);
CREATE INDEX videos_category_id_idx   ON public.videos (category_id);
CREATE INDEX videos_tags_gin          ON public.videos USING GIN (tags);

CREATE TRIGGER videos_set_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. comments  (threaded, moderation workflow)
-------------------------------------------------------------------------------
CREATE TABLE public.comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  status          public.comment_status NOT NULL DEFAULT 'pending',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  reported_count  INTEGER NOT NULL DEFAULT 0,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_content_length CHECK (char_length(content) BETWEEN 1 AND 5000),
  CONSTRAINT comments_likes_nn       CHECK (likes_count >= 0),
  CONSTRAINT comments_reported_nn    CHECK (reported_count >= 0)
);

CREATE INDEX comments_article_id_idx ON public.comments (article_id, created_at DESC);
CREATE INDEX comments_user_id_idx    ON public.comments (user_id);
CREATE INDEX comments_parent_id_idx  ON public.comments (parent_id);
CREATE INDEX comments_status_idx     ON public.comments (status);

CREATE TRIGGER comments_set_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. polls / poll_votes
-------------------------------------------------------------------------------
CREATE TABLE public.polls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT NOT NULL,
  options_json    JSONB NOT NULL,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  article_id      UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  total_votes     INTEGER NOT NULL DEFAULT 0,
  allow_multiple  BOOLEAN NOT NULL DEFAULT false,
  require_login   BOOLEAN NOT NULL DEFAULT true,
  status          TEXT NOT NULL DEFAULT 'active',
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT polls_question_length CHECK (char_length(question) BETWEEN 1 AND 300),
  CONSTRAINT polls_total_votes_nn  CHECK (total_votes >= 0),
  CONSTRAINT polls_status_allowed  CHECK (status IN ('active', 'closed', 'archived'))
);

CREATE INDEX polls_article_id_idx ON public.polls (article_id);
CREATE INDEX polls_status_idx     ON public.polls (status);

CREATE TABLE public.poll_votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id       UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index  INTEGER NOT NULL,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT poll_votes_option_nn CHECK (option_index >= 0)
);

CREATE INDEX poll_votes_poll_id_idx ON public.poll_votes (poll_id);
CREATE INDEX poll_votes_user_id_idx ON public.poll_votes (user_id);

-------------------------------------------------------------------------------
-- 7. rss_internal_feeds / rss_external_sources
-------------------------------------------------------------------------------
CREATE TABLE public.rss_internal_feeds (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  language      TEXT NOT NULL DEFAULT 'en',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  item_count    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rss_internal_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT rss_internal_lang_format CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT rss_internal_item_nn     CHECK (item_count >= 0)
);

CREATE UNIQUE INDEX rss_internal_slug_unique ON public.rss_internal_feeds (slug);

CREATE TABLE public.rss_external_sources (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  feed_url                  TEXT NOT NULL,
  category_id               UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  auto_publish              BOOLEAN NOT NULL DEFAULT false,
  refresh_interval_minutes  INTEGER NOT NULL DEFAULT 60,
  last_fetched_at           TIMESTAMPTZ,
  items_imported            INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'active',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rss_external_refresh_positive CHECK (refresh_interval_minutes > 0),
  CONSTRAINT rss_external_items_nn         CHECK (items_imported >= 0),
  CONSTRAINT rss_external_status_allowed   CHECK (status IN ('active', 'paused', 'errored'))
);

CREATE UNIQUE INDEX rss_external_feed_url_unique ON public.rss_external_sources (feed_url);

-------------------------------------------------------------------------------
-- 8. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_internal_feeds    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_external_sources  ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 9. Policies — articles
-------------------------------------------------------------------------------
-- Public: only published. Authors: their own drafts. Editors/admins: everything.
CREATE POLICY articles_select_public ON public.articles
  FOR SELECT USING (
    status = 'published'
    OR author_id = auth.uid()
    OR public.is_at_least('editor')
  );

CREATE POLICY articles_insert_author ON public.articles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_at_least('author')
  );

CREATE POLICY articles_update_author_or_editor ON public.articles
  FOR UPDATE USING (
    (author_id = auth.uid() AND status IN ('draft', 'review', 'rejected'))
    OR public.is_at_least('editor')
  )
  WITH CHECK (
    (author_id = auth.uid() AND status IN ('draft', 'review', 'rejected'))
    OR public.is_at_least('editor')
  );

CREATE POLICY articles_delete_editor ON public.articles
  FOR DELETE USING (public.is_at_least('editor'));

-------------------------------------------------------------------------------
-- 10. Policies — article_tags
-- Read mirrors article visibility; write = anyone who can update the article.
-------------------------------------------------------------------------------
CREATE POLICY article_tags_select ON public.article_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id
        AND (a.status = 'published' OR a.author_id = auth.uid() OR public.is_at_least('editor'))
    )
  );

CREATE POLICY article_tags_insert ON public.article_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id
        AND (
          (a.author_id = auth.uid() AND a.status IN ('draft', 'review', 'rejected'))
          OR public.is_at_least('editor')
        )
    )
  );

CREATE POLICY article_tags_delete ON public.article_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id
        AND (
          (a.author_id = auth.uid() AND a.status IN ('draft', 'review', 'rejected'))
          OR public.is_at_least('editor')
        )
    )
  );

-------------------------------------------------------------------------------
-- 11. Policies — article_revisions  (append-only; readable if article readable)
-------------------------------------------------------------------------------
CREATE POLICY article_revisions_select ON public.article_revisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id
        AND (a.author_id = auth.uid() OR public.is_at_least('editor'))
    )
  );

CREATE POLICY article_revisions_insert ON public.article_revisions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND revised_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id
        AND (a.author_id = auth.uid() OR public.is_at_least('editor'))
    )
  );

-------------------------------------------------------------------------------
-- 12. Policies — videos  (same pattern as articles)
-------------------------------------------------------------------------------
CREATE POLICY videos_select_public ON public.videos
  FOR SELECT USING (
    status = 'published'
    OR author_id = auth.uid()
    OR public.is_at_least('editor')
  );

CREATE POLICY videos_insert_author ON public.videos
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
    AND public.is_at_least('author')
  );

CREATE POLICY videos_update_author_or_editor ON public.videos
  FOR UPDATE USING (
    (author_id = auth.uid() AND status IN ('draft', 'review', 'rejected'))
    OR public.is_at_least('editor')
  )
  WITH CHECK (
    (author_id = auth.uid() AND status IN ('draft', 'review', 'rejected'))
    OR public.is_at_least('editor')
  );

CREATE POLICY videos_delete_editor ON public.videos
  FOR DELETE USING (public.is_at_least('editor'));

-------------------------------------------------------------------------------
-- 13. Policies — comments
-- Public sees approved comments on published articles;
-- users see their own; editors/admins see all.
-------------------------------------------------------------------------------
CREATE POLICY comments_select ON public.comments
  FOR SELECT USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR public.is_at_least('editor')
  );

CREATE POLICY comments_insert_authenticated ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.allow_comments = true AND a.status = 'published'
    )
  );

CREATE POLICY comments_update_self_or_editor ON public.comments
  FOR UPDATE USING (user_id = auth.uid() OR public.is_at_least('editor'))
  WITH CHECK (user_id = auth.uid() OR public.is_at_least('editor'));

CREATE POLICY comments_delete_self_or_editor ON public.comments
  FOR DELETE USING (user_id = auth.uid() OR public.is_at_least('editor'));

-------------------------------------------------------------------------------
-- 14. Policies — polls / poll_votes
-------------------------------------------------------------------------------
CREATE POLICY polls_select_public ON public.polls FOR SELECT USING (true);

CREATE POLICY polls_insert_author ON public.polls
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND author_id = auth.uid() AND public.is_at_least('author')
  );

CREATE POLICY polls_update_author_or_editor ON public.polls
  FOR UPDATE USING (author_id = auth.uid() OR public.is_at_least('editor'))
  WITH CHECK (author_id = auth.uid() OR public.is_at_least('editor'));

CREATE POLICY polls_delete_author_or_editor ON public.polls
  FOR DELETE USING (author_id = auth.uid() OR public.is_at_least('editor'));

CREATE POLICY poll_votes_select_public ON public.poll_votes FOR SELECT USING (true);

CREATE POLICY poll_votes_insert ON public.poll_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_id
        AND p.status = 'active'
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND (p.require_login = false OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
    )
  );

-------------------------------------------------------------------------------
-- 15. Policies — rss  (public read, admin-only write)
-------------------------------------------------------------------------------
CREATE POLICY rss_internal_select_public ON public.rss_internal_feeds FOR SELECT USING (true);
CREATE POLICY rss_internal_insert_admin  ON public.rss_internal_feeds FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY rss_internal_update_admin  ON public.rss_internal_feeds FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rss_internal_delete_admin  ON public.rss_internal_feeds FOR DELETE USING (public.is_admin());

CREATE POLICY rss_external_select_admin  ON public.rss_external_sources FOR SELECT USING (public.is_admin());
CREATE POLICY rss_external_insert_admin  ON public.rss_external_sources FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY rss_external_update_admin  ON public.rss_external_sources FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY rss_external_delete_admin  ON public.rss_external_sources FOR DELETE USING (public.is_admin());
