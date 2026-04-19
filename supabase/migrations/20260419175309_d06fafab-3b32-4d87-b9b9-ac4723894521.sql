-- Schedule blocks (editable daily timetable)
CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT,                -- NULL = every day, else 0-6 (Sun..Sat)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  activity TEXT NOT NULL,
  category TEXT,                       -- e.g. 'data-science', 'real-estate', 'sleep'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read schedule" ON public.schedule_blocks FOR SELECT USING (true);
CREATE POLICY "public write schedule" ON public.schedule_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "public update schedule" ON public.schedule_blocks FOR UPDATE USING (true);
CREATE POLICY "public delete schedule" ON public.schedule_blocks FOR DELETE USING (true);
CREATE TRIGGER schedule_blocks_set_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-node AI link cache
CREATE TABLE public.topic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL UNIQUE,
  label TEXT,
  overview TEXT,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.topic_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read topic_links" ON public.topic_links FOR SELECT USING (true);
CREATE POLICY "public write topic_links" ON public.topic_links FOR INSERT WITH CHECK (true);
CREATE POLICY "public update topic_links" ON public.topic_links FOR UPDATE USING (true);
CREATE POLICY "public delete topic_links" ON public.topic_links FOR DELETE USING (true);
CREATE INDEX idx_topic_links_refreshed ON public.topic_links(refreshed_at);
CREATE TRIGGER topic_links_set_updated_at
  BEFORE UPDATE ON public.topic_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tomorrow plan column on journal entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS ai_tomorrow_plan JSONB;