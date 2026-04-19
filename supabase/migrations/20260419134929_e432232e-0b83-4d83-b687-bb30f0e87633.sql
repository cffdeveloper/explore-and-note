-- Notes per item (item_id is the leaf bullet's stable slug, e.g. "1.1.1.linear-algebra.vectors")
CREATE TABLE public.item_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.item_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('link','file')),
  title TEXT,
  url TEXT NOT NULL,
  storage_path TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_item ON public.item_attachments(item_id);

ALTER TABLE public.item_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_attachments ENABLE ROW LEVEL SECURITY;

-- No-login app: open access to everyone (single shared workspace)
CREATE POLICY "public read notes" ON public.item_notes FOR SELECT USING (true);
CREATE POLICY "public write notes" ON public.item_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "public update notes" ON public.item_notes FOR UPDATE USING (true);
CREATE POLICY "public delete notes" ON public.item_notes FOR DELETE USING (true);

CREATE POLICY "public read att" ON public.item_attachments FOR SELECT USING (true);
CREATE POLICY "public write att" ON public.item_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "public update att" ON public.item_attachments FOR UPDATE USING (true);
CREATE POLICY "public delete att" ON public.item_attachments FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_notes_updated
BEFORE UPDATE ON public.item_notes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blueprint', 'blueprint', true);

CREATE POLICY "public read blueprint" ON storage.objects FOR SELECT USING (bucket_id = 'blueprint');
CREATE POLICY "public upload blueprint" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blueprint');
CREATE POLICY "public delete blueprint" ON storage.objects FOR DELETE USING (bucket_id = 'blueprint');