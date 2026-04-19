-- Add fields for sorting + filtering, keep history
ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS pillar text,
  ADD COLUMN IF NOT EXISTS intel jsonb;

-- Dedupe key: same kind + url should not be re-inserted
CREATE UNIQUE INDEX IF NOT EXISTS recommendations_kind_url_uidx
  ON public.recommendations (kind, url)
  WHERE url IS NOT NULL;

CREATE INDEX IF NOT EXISTS recommendations_deadline_idx
  ON public.recommendations (kind, deadline_at NULLS LAST, created_at DESC);

-- Tighten: drop the public delete so the repository accumulates
DROP POLICY IF EXISTS "public delete recs" ON public.recommendations;

-- Enable cron + net for hourly auto-refresh
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;