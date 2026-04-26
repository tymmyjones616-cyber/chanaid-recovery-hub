
-- Remove em dashes from all text columns across the database

UPDATE public.site_settings 
SET 
  default_seo_title = REPLACE(default_seo_title, '—', '-'),
  default_seo_description = REPLACE(default_seo_description, '—', '-'),
  footer_text = REPLACE(footer_text, '—', '-'),
  tagline = REPLACE(tagline, '—', '-');

UPDATE public.services 
SET 
  name = REPLACE(name, '—', '-'),
  short_description = REPLACE(short_description, '—', '-'),
  problem_description = REPLACE(problem_description, '—', '-'),
  recovery_process = REPLACE(recovery_process, '—', '-'),
  hero_headline = REPLACE(hero_headline, '—', '-'),
  hero_subheadline = REPLACE(hero_subheadline, '—', '-');

UPDATE public.blog_posts 
SET 
  title = REPLACE(title, '—', '-'),
  content = REPLACE(content, '—', '-'),
  excerpt = REPLACE(excerpt, '—', '-');

UPDATE public.testimonials 
SET 
  quote = REPLACE(quote, '—', '-'),
  client_name = REPLACE(client_name, '—', '-'),
  location = REPLACE(location, '—', '-');

UPDATE public.faqs 
SET 
  question = REPLACE(question, '—', '-'),
  answer = REPLACE(answer, '—', '-');
