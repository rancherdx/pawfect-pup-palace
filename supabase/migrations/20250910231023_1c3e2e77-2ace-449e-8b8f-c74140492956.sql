-- Create addon_items table for checkout addons
CREATE TABLE public.addon_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.addon_items ENABLE ROW LEVEL SECURITY;

-- Create policies for addon items
CREATE POLICY "Addon items are publicly viewable" 
ON public.addon_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage addon items" 
ON public.addon_items 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_addon_items_updated_at
BEFORE UPDATE ON public.addon_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample addon items
INSERT INTO public.addon_items (name, description, price, image_url, category) VALUES
  ('Puppy Starter Kit', 'Food, bowls, collar, and leash to get started', 75, 'https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', 'essentials'),
  ('Training Sessions (3)', 'Three private training sessions with our expert', 120, 'https://images.unsplash.com/photo-1600272008408-6e05d5aa3e6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', 'training'),
  ('Premium Bed', 'Comfortable, washable bed for your new puppy', 60, 'https://images.unsplash.com/photo-1636066429695-a7518ab7db5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', 'comfort'),
  ('Health Check Package', 'First vet visit and basic vaccinations', 150, 'https://images.unsplash.com/photo-1610117802181-5fcbac55b61f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', 'health');