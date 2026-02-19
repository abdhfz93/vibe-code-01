-- Create personal_notes table
CREATE TABLE IF NOT EXISTS public.personal_notes (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  encrypted_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own notes." ON public.personal_notes
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create their own notes." ON public.personal_notes
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own notes." ON public.personal_notes
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.personal_notes
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
