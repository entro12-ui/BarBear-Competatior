-- Optional demo seed (run after schema.sql and after creating your admin user)
-- Replace COMPETITION values as needed.

insert into public.competitions (
  name,
  slug,
  description,
  rules,
  location,
  start_date,
  end_date,
  status,
  public_results
)
values (
  'Best Barber Hair Style Competition 2026',
  'best-barber-2026',
  'Vote for the barber who created the most creative and professional hair style.',
  E'Each person can vote only once.\nOne vote is allowed per email address.\nYou must select only one competitor.\nMultiple votes using the same email are not allowed.\nAdmin can close voting when the competition ends.',
  'Downtown Barber Arena',
  now(),
  now() + interval '14 days',
  'active',
  false
)
on conflict (slug) do nothing;
