
CREATE TABLE public.mockup_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  rotation_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  rotation_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  rotation_z DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mockup_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions" ON public.mockup_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.mockup_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.mockup_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sessions" ON public.mockup_sessions FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.mockup_sessions;
