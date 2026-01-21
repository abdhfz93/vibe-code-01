-- Migration to update customer_masterlist table with new fields
ALTER TABLE public.customer_masterlist 
RENAME COLUMN office_close TO office_hours;

ALTER TABLE public.customer_masterlist 
RENAME COLUMN endpoint_class_1 TO endpoint_classification;

-- Drop endpoint_class_2 as we are unifying it
ALTER TABLE public.customer_masterlist 
DROP COLUMN IF EXISTS endpoint_class_2;

-- Add new columns
ALTER TABLE public.customer_masterlist 
ADD COLUMN IF NOT EXISTS client_contact TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT;
