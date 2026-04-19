
CREATE TABLE public.journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  duration_years int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read journey" ON public.journey FOR SELECT USING (true);
CREATE POLICY "public write journey" ON public.journey FOR INSERT WITH CHECK (true);
-- intentionally NO update/delete policies: timer is unpausable

CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  ai_analysis text,
  ai_next_day text,
  ai_draft text,
  analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read journal" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "public write journal" ON public.journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "public update journal" ON public.journal_entries FOR UPDATE USING (true);
CREATE POLICY "public delete journal" ON public.journal_entries FOR DELETE USING (true);

CREATE TRIGGER journal_set_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX journal_entries_date_idx ON public.journal_entries(entry_date DESC);
