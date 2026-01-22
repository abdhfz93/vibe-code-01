-- Add checklist column to maintenance_records table
ALTER TABLE maintenance_records 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have a default checklist (optional, but ensures consistency)
-- This would depend on if we want old records to suddenly have checklists.
-- For now, new records will use the default value.
