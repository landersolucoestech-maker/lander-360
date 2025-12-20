-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  service_type TEXT NOT NULL,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  discount_value NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  final_price NUMERIC NOT NULL DEFAULT 0,
  observations TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view services"
ON public.services FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert services"
ON public.services FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update services"
ON public.services FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete services"
ON public.services FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();