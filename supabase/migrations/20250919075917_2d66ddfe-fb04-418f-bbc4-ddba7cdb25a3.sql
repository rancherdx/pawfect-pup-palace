-- Phase 1: Critical Database Updates for Slug Functionality and SEO
-- Adding slug fields to puppies and litters tables for SEO-friendly URLs

-- Add slug column to puppies table
ALTER TABLE public.puppies 
ADD COLUMN slug text UNIQUE;

-- Add slug column to litters table  
ALTER TABLE public.litters
ADD COLUMN slug text UNIQUE;

-- Create function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    slug_text text;
BEGIN
    -- Convert to lowercase, replace spaces and special chars with hyphens
    slug_text := lower(trim(input_text));
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s]', '', 'g');
    slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
    slug_text := trim(slug_text, '-');
    
    -- Ensure slug is not empty
    IF slug_text = '' THEN
        slug_text := 'unnamed';
    END IF;
    
    RETURN slug_text;
END;
$$;

-- Create function to ensure unique slugs for puppies
CREATE OR REPLACE FUNCTION public.ensure_unique_puppy_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
BEGIN
    -- Only generate slug if not provided or if name changed
    IF NEW.slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name AND OLD.slug = public.generate_slug(OLD.name)) THEN
        base_slug := public.generate_slug(NEW.name);
        final_slug := base_slug;
        
        -- Check for conflicts and append number if needed
        WHILE EXISTS (SELECT 1 FROM public.puppies WHERE slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create function to ensure unique slugs for litters
CREATE OR REPLACE FUNCTION public.ensure_unique_litter_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
BEGIN
    -- Only generate slug if not provided or if name changed
    IF NEW.slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name AND OLD.slug = public.generate_slug(OLD.name)) THEN
        base_slug := public.generate_slug(NEW.name);
        final_slug := base_slug;
        
        -- Check for conflicts and append number if needed
        WHILE EXISTS (SELECT 1 FROM public.litters WHERE slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers for automatic slug generation
CREATE TRIGGER puppy_slug_trigger
    BEFORE INSERT OR UPDATE ON public.puppies
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_unique_puppy_slug();

CREATE TRIGGER litter_slug_trigger
    BEFORE INSERT OR UPDATE ON public.litters
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_unique_litter_slug();

-- Generate slugs for existing puppies (update existing records)
UPDATE public.puppies 
SET slug = public.generate_slug(name) 
WHERE slug IS NULL;

-- Handle conflicts for existing puppies
DO $$
DECLARE
    puppy_record RECORD;
    base_slug text;
    final_slug text;
    counter integer;
BEGIN
    FOR puppy_record IN 
        SELECT id, name, slug FROM public.puppies 
        WHERE slug IN (
            SELECT slug FROM public.puppies 
            WHERE slug IS NOT NULL 
            GROUP BY slug HAVING COUNT(*) > 1
        )
        ORDER BY created_at
    LOOP
        base_slug := public.generate_slug(puppy_record.name);
        final_slug := base_slug;
        counter := 0;
        
        WHILE EXISTS (SELECT 1 FROM public.puppies WHERE slug = final_slug AND id != puppy_record.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        UPDATE public.puppies SET slug = final_slug WHERE id = puppy_record.id;
    END LOOP;
END $$;

-- Generate slugs for existing litters
UPDATE public.litters 
SET slug = public.generate_slug(name) 
WHERE slug IS NULL;

-- Handle conflicts for existing litters
DO $$
DECLARE
    litter_record RECORD;
    base_slug text;
    final_slug text;
    counter integer;
BEGIN
    FOR litter_record IN 
        SELECT id, name, slug FROM public.litters 
        WHERE slug IN (
            SELECT slug FROM public.litters 
            WHERE slug IS NOT NULL 
            GROUP BY slug HAVING COUNT(*) > 1
        )
        ORDER BY created_at
    LOOP
        base_slug := public.generate_slug(litter_record.name);
        final_slug := base_slug;
        counter := 0;
        
        WHILE EXISTS (SELECT 1 FROM public.litters WHERE slug = final_slug AND id != litter_record.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        UPDATE public.litters SET slug = final_slug WHERE id = litter_record.id;
    END LOOP;
END $$;

-- Create indexes for better performance on slug queries
CREATE INDEX idx_puppies_slug ON public.puppies(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_litters_slug ON public.litters(slug) WHERE slug IS NOT NULL;

-- Update RLS policies to allow slug-based queries for public access
CREATE POLICY "puppies_select_public_by_slug" 
ON public.puppies 
FOR SELECT 
USING (slug IS NOT NULL);

CREATE POLICY "litters_select_public_by_slug" 
ON public.litters 
FOR SELECT 
USING (slug IS NOT NULL);