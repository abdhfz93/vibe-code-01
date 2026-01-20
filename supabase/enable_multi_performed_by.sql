-- Drop the check constraint on performed_by to allow multiple values
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_performed_by_check;

-- Also drop the old one if it still exists
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_perform_by_check;
