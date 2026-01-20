-- Create sequence for maintenance numbers
CREATE SEQUENCE IF NOT EXISTS maintenance_number_seq START 1;

-- Create function to generate maintenance number
CREATE OR REPLACE FUNCTION generate_maintenance_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  formatted_num TEXT;
BEGIN
  next_num := nextval('maintenance_number_seq');
  formatted_num := 'MNT' || LPAD(next_num::TEXT, 5, '0');
  RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_number TEXT UNIQUE NOT NULL DEFAULT generate_maintenance_number(),
  submit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  server_name TEXT NOT NULL CHECK (server_name IN (
    'sip00', 'sip01', 'sip02', 'sip03', 'sip04', 'sip05', 'sip07', 'sip08', 'sip09', 
    'sip10', 'sip11', 'sip15', 'sip17', 'sip19', 'sip20', 'sip21', 'sip22', 'sip26', 
    'sip27', 'sip28', 'sip29', 'sip30', 'sip32', 'sip33', 'sip35', 'sip37', 'sip45', 
    'sip46', 'sip50', 'sip52', 'sip54', 'sip55', 'sip56', 'sip58', 'sip59', 'sip60', 
    'sip61', 'sip64', 'sip65', 'sip66', 'sip67', 'sip70', 'sip103', 'sip104', 
    'sip205', 'sip206', 'sip207', 'sip208', 'sip209', 'sip210', 'sip212', 'sip213', 
    'sip214', 'sip215', 'sip216', 'All Servers', 'Other Server', 'Multiple Servers'
  )),
  client_name TEXT NOT NULL CHECK (client_name IN (
    'Asmara', 'At Sunrise', 'Best Home', 'Busy Bees SG', 'CBRE', 'Certis', 'Challenger', 
    'Chan Brothers', 'City State', 'DHL Malaysia', 'Dr Anywhere', 'Envac', 'Eversafe', 
    'Getgo', 'hisense', 'HSC Cancer', 'Interwell', 'iSetan', 'KFCPH', 'LHN Parking', 
    'Nippon Paint', 'NTUC Fairprice', 'Nuffield Dental', 'Origin', 'Other Client', 
    'pegasus', 'PLE', 'PMG Asia', 'Scania', 'Skool4Kidz', 'SMG Group/LSI', 'SMG IP', 
    'SMRT', 'Sysmex Malaysia', 'Touch Community', 'Vertex', 'Vistek', 'Webull', 
    'Wong Fong', 'Woosa'
  )),
  maintenance_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  maintenance_reason TEXT NOT NULL CHECK (maintenance_reason IN ('Portal Upgrade', 'DB Migration', 'OS Patching', 'Key Rotation', 'Asterisk Upgrade', 'WAF Implementation', 'SSL Renewal', 'Other Reasons')),
  approver TEXT NOT NULL CHECK (approver IN ('john', 'sayem', 'naveed')),
  performed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'on-hold', 'failed', 'completed')),
  proof_of_maintenance JSONB DEFAULT '[]'::jsonb,
  remark TEXT CHECK (char_length(remark) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_maintenance_number ON maintenance_records(maintenance_number);
CREATE INDEX IF NOT EXISTS idx_server_name ON maintenance_records(server_name);
CREATE INDEX IF NOT EXISTS idx_client_name ON maintenance_records(client_name);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_records(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_submit_date ON maintenance_records(submit_date);
CREATE INDEX IF NOT EXISTS idx_status ON maintenance_records(status);

-- Enable Row Level Security (optional, but good practice)
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're not using auth yet)
CREATE POLICY "Allow all operations" ON maintenance_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for maintenance proof files (run this in Supabase Storage section or via API)
-- The bucket will be created via the app code if it doesn't exist
