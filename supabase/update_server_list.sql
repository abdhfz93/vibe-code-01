-- 1. Drop existing check constraint
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_server_name_check;

-- 2. Clean up existing data to match the new format (change sip9 to sip09)
UPDATE maintenance_records 
SET server_name = 'sip09' 
WHERE server_name = 'sip9';

-- 3. Add new expanded check constraint
ALTER TABLE maintenance_records
ADD CONSTRAINT maintenance_records_server_name_check
CHECK (server_name IN (
  'sip00', 'sip01', 'sip02', 'sip03', 'sip04', 'sip05', 'sip07', 'sip08', 'sip09', 
  'sip10', 'sip11', 'sip15', 'sip17', 'sip19', 'sip20', 'sip21', 'sip22', 'sip26', 
  'sip27', 'sip28', 'sip29', 'sip30', 'sip32', 'sip33', 'sip35', 'sip37', 'sip45', 
  'sip46', 'sip50', 'sip52', 'sip54', 'sip55', 'sip56', 'sip58', 'sip59', 'sip60', 
  'sip61', 'sip64', 'sip65', 'sip66', 'sip67', 'sip70', 'sip103', 'sip104', 
  'sip205', 'sip206', 'sip207', 'sip208', 'sip209', 'sip210', 'sip212', 'sip213', 
  'sip214', 'sip215', 'sip216', 'All Servers', 'Other Server', 'Multiple Servers'
));
