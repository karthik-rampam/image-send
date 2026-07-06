
CREATE TABLE public.captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_data TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.captures TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.captures TO authenticated;
GRANT ALL ON public.captures TO service_role;

ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert captures" ON public.captures
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view captures" ON public.captures
  FOR SELECT TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.captures;
ALTER TABLE public.captures REPLICA IDENTITY FULL;

CREATE INDEX captures_created_at_idx ON public.captures (created_at DESC);
