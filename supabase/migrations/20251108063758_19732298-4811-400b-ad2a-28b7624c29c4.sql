-- Add parent_id column to categories table for subcategories
ALTER TABLE public.categories 
ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create index for better performance when querying subcategories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);