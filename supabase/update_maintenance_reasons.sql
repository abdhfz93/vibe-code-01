-- 1. Drop the existing check constraint
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_maintenance_reason_check;

-- 2. Update existing data to match the new format
UPDATE maintenance_records
SET maintenance_reason = 'Portal Upgrade'
WHERE maintenance_reason IN ('reporting portal', 'Reporting Portal Upgrade');

UPDATE maintenance_records
SET maintenance_reason = 'DB Migration'
WHERE maintenance_reason = 'db migration';

UPDATE maintenance_records
SET maintenance_reason = 'OS Patching'
WHERE maintenance_reason = 'os patching';

-- 3. Add the new check constraint with proper casing
ALTER TABLE maintenance_records
ADD CONSTRAINT maintenance_records_maintenance_reason_check
CHECK (maintenance_reason IN ('Portal Upgrade', 'DB Migration', 'OS Patching', 'Key Rotation', 'Asterisk Upgrade', 'WAF Implementation', 'SSL Renewal', 'Other Reasons'));
