-- Create parents table for managing sire and dam information
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  bloodline_info TEXT,
  health_clearances TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Create policies for parents
CREATE POLICY "Parents are publicly viewable" 
ON public.parents 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage parents" 
ON public.parents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add parent references to litters table
ALTER TABLE public.litters 
ADD COLUMN sire_id UUID REFERENCES public.parents(id),
ADD COLUMN dam_id UUID REFERENCES public.parents(id);

-- Create trigger for parent timestamps
CREATE TRIGGER update_parents_updated_at
BEFORE UPDATE ON public.parents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_parents_breed ON public.parents(breed);
CREATE INDEX idx_parents_gender ON public.parents(gender);
CREATE INDEX idx_parents_active ON public.parents(is_active);
CREATE INDEX idx_litters_sire ON public.litters(sire_id);
CREATE INDEX idx_litters_dam ON public.litters(dam_id);