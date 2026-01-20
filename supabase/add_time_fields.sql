-- Add start_time and end_time columns
ALTER TABLE maintenance_records
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Update existing records to have a default time if needed (optional)
UPDATE maintenance_records SET start_time = '09:00:00' WHERE start_time IS NULL;
UPDATE maintenance_records SET end_time = '17:00:00' WHERE end_time IS NULL;

-- Make them NOT NULL after updating existing data
ALTER TABLE maintenance_records
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;
