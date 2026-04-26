-- Add featured_image and author columns to blog_posts if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured_image') THEN
        ALTER TABLE public.blog_posts ADD COLUMN featured_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author') THEN
        ALTER TABLE public.blog_posts ADD COLUMN author TEXT DEFAULT 'Recovery Expert';
    END IF;
END $$;

-- Update existing blog posts with premium images
UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800',
    author = 'Sarah Jenkins'
WHERE slug = 'recovering-crypto-usa';

UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    author = 'Mark Thompson'
WHERE slug = 'uk-financial-recovery';

UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800',
    author = 'James Cook'
WHERE slug = 'australia-crypto-recovery';

UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    author = 'Emily White'
WHERE slug = 'canada-investor-protection';

UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1512453979798-5ea4a73a88d4?auto=format&fit=crop&q=80&w=800',
    author = 'Ahmed Al-Sayed'
WHERE slug = 'uae-recovery-dubai';

UPDATE public.blog_posts SET 
    featured_image = 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800',
    author = 'Khalid Mansour'
WHERE slug = 'saudi-arabia-scam-recovery';
