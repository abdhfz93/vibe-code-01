-- Rename perform_by to performed_by
ALTER TABLE maintenance_records 
RENAME COLUMN perform_by TO performed_by;

-- Drop and recreate the check constraint with the new name
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_perform_by_check;

ALTER TABLE maintenance_records
ADD CONSTRAINT maintenance_records_performed_by_check
CHECK (performed_by IN ('hafiz', 'shahid', 'aiman', 'All Members'));
