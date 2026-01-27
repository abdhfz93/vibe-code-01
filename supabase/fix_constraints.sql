-- Drop check constraints to allow free text input for server and client names
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_server_name_check;

ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_client_name_check;

-- Optional: If you want to allow more approvers in the future, drop this too
-- ALTER TABLE maintenance_records
-- DROP CONSTRAINT IF EXISTS maintenance_records_approver_check;
