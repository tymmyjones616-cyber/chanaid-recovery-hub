
drop policy if exists "anyone can submit leads" on public.leads;

create policy "anyone can submit valid leads" on public.leads
for insert
with check (
  length(first_name) between 1 and 100
  and (last_name is null or length(last_name) <= 100)
  and length(email) between 3 and 255
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and (phone is null or length(phone) <= 50)
  and (amount_lost is null or length(amount_lost) <= 50)
  and (scam_type is null or length(scam_type) <= 100)
  and (message is null or length(message) <= 5000)
  and (source_page is null or length(source_page) <= 200)
  and status = 'new'
  and notes is null
);
