-- Migration: Add status column to existing maintenance_records table
-- Run this if you already have the maintenance_records table created

-- Add status column with default value
ALTER TABLE maintenance_records 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'on-hold', 'failed', 'completed'));

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_status ON maintenance_records(status);
