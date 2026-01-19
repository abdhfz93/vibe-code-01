-- Migration: Update proof_of_maintenance to support multiple files (JSON array)
-- Run this if you already have the maintenance_records table with single proof

-- Convert existing single proof to array format
UPDATE maintenance_records
SET proof_of_maintenance = 
  CASE 
    WHEN proof_of_maintenance IS NULL OR proof_of_maintenance = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(proof_of_maintenance)
  END;

-- Change column type to JSONB
ALTER TABLE maintenance_records 
ALTER COLUMN proof_of_maintenance TYPE JSONB 
USING proof_of_maintenance::jsonb;

-- Set default to empty array
ALTER TABLE maintenance_records 
ALTER COLUMN proof_of_maintenance SET DEFAULT '[]'::jsonb;
