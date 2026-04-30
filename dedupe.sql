DELETE FROM faqs WHERE id NOT IN (
  SELECT min_id FROM (
    SELECT MIN(id) as min_id FROM faqs GROUP BY question
  )
);

DELETE FROM testimonials WHERE id NOT IN (
  SELECT min_id FROM (
    SELECT MIN(id) as min_id FROM testimonials GROUP BY client_name, quote
  )
);
