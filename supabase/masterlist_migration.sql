-- Create customer_masterlist table
CREATE TABLE IF NOT EXISTS public.customer_masterlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sip_id TEXT,
    company_name TEXT NOT NULL,
    provider TEXT,
    custom_features TEXT,
    ip_address TEXT,
    server_url TEXT,
    subscription_plan TEXT,
    office_close TEXT,
    trunks_lines INTEGER DEFAULT 0,
    extensions INTEGER DEFAULT 0,
    category TEXT,
    endpoint_class_1 TEXT,
    endpoint_class_2 TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_masterlist_updated_at
    BEFORE UPDATE ON public.customer_masterlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.customer_masterlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (internal app)
CREATE POLICY "Allow all access to customer_masterlist"
    ON public.customer_masterlist
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
