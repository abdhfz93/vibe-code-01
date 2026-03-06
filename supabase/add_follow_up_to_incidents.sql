-- Add follow_up column to incident_reports table
ALTER TABLE public.incident_reports 
ADD COLUMN IF NOT EXISTS follow_up jsonb DEFAULT '[]'::jsonb;
