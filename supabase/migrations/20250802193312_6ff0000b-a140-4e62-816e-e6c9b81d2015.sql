-- Add new columns to posts table for enhanced functionality
ALTER TABLE public.posts 
ADD COLUMN video_url TEXT,
ADD COLUMN post_type TEXT DEFAULT 'portfolio' CHECK (post_type IN ('portfolio', 'sale')),
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN currency TEXT DEFAULT 'USD';

-- Create index for better performance on post_type queries
CREATE INDEX idx_posts_type_published ON public.posts(post_type, published);

-- Create index for sale items with price
CREATE INDEX idx_posts_sale_price ON public.posts(post_type, price) WHERE post_type = 'sale';