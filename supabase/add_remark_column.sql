-- Add remark column with length constraint
ALTER TABLE maintenance_records
ADD COLUMN IF NOT EXISTS remark TEXT CHECK (char_length(remark) <= 1000);
