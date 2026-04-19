CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('event','opportunity')),
  title TEXT NOT NULL,
  url TEXT,
  date_text TEXT,
  reason TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read recs" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "public write recs" ON public.recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete recs" ON public.recommendations FOR DELETE USING (true);

CREATE INDEX idx_recommendations_kind_created ON public.recommendations (kind, created_at DESC);