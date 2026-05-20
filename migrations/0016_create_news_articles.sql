-- Migration 0016: news_articles table for aggregated rewritten articles
-- Stores RSS-sourced articles after AI rewrite, making them first-party content.

CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_rewritten TEXT,
  excerpt TEXT,
  excerpt_rewritten TEXT,
  content_html TEXT,
  content_html_rewritten TEXT,
  original_url TEXT NOT NULL,
  featured_image TEXT,
  category TEXT,
  region TEXT DEFAULT 'world',
  source_domain TEXT,
  author TEXT DEFAULT 'NewsPulse PRO',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  is_rewritten BOOLEAN DEFAULT false,
  rewrite_version INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON public.news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_region ON public.news_articles(region);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_view_count ON public.news_articles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_original_url ON public.news_articles(original_url);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read published articles
CREATE POLICY "Anyone can read published news_articles"
  ON public.news_articles
  FOR SELECT
  USING (status = 'published');

-- RLS: Admin/editor can manage all
CREATE POLICY "Admin can manage news_articles"
  ON public.news_articles
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor', 'author')
    )
  );

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_news_articles_updated_at();
