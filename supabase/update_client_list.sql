-- 1. Drop the existing check constraint
ALTER TABLE maintenance_records
DROP CONSTRAINT IF EXISTS maintenance_records_client_name_check;

-- 2. Update existing data to match new casing if needed
UPDATE maintenance_records SET client_name = 'Certis' WHERE client_name = 'certis';
UPDATE maintenance_records SET client_name = 'Getgo' WHERE client_name = 'getgo';

-- 3. Add the new expanded check constraint
ALTER TABLE maintenance_records
ADD CONSTRAINT maintenance_records_client_name_check
CHECK (client_name IN (
  'Asmara', 'At Sunrise', 'Best Home', 'Busy Bees SG', 'CBRE', 'Certis', 'Challenger', 
  'Chan Brothers', 'City State', 'DHL Malaysia', 'Dr Anywhere', 'Envac', 'Eversafe', 
  'Getgo', 'hisense', 'HSC Cancer', 'Interwell', 'iSetan', 'KFCPH', 'LHN Parking', 
  'Nippon Paint', 'NTUC Fairprice', 'Nuffield Dental', 'Origin', 'Other Client', 
  'pegasus', 'PLE', 'PMG Asia', 'Scania', 'Skool4Kidz', 'SMG Group/LSI', 'SMG IP', 
  'SMRT', 'Sysmex Malaysia', 'Touch Community', 'Vertex', 'Vistek', 'Webull', 
  'Wong Fong', 'Woosa'
));
