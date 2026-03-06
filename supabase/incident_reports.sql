-- Table for AI-generated incident reports with auto-generated INC numbers
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id bigserial not null,
  incident_number text GENERATED ALWAYS as (('INC'::text || lpad((id)::text, 5, '0'::text))) STORED null,
  title text not null,
  content text not null,
  sip_id text null,
  client_name text null,
  incident_date date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint incident_reports_pkey primary key (id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and insert reports
CREATE POLICY "Authenticated users can manage reports" ON public.incident_reports
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
