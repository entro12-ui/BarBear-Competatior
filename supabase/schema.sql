-- Barbear Competition Voting System
-- Run this in the Supabase SQL Editor

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.competition_status as enum (
    'draft', 'upcoming', 'active', 'closed', 'completed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.competitor_status as enum (
    'draft', 'published', 'hidden'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.image_type as enum (
    'front', 'back', 'left', 'right', 'profile'
  );
exception when duplicate_object then null;
end $$;

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Competitions
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  rules text not null default '',
  location text,
  logo_url text,
  start_date timestamptz,
  end_date timestamptz,
  status public.competition_status not null default 'draft',
  public_results boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Competitors
create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  full_name text not null,
  barber_name text not null,
  profile_photo_url text,
  short_bio text not null default '',
  description text not null default '',
  phone text,
  competition_number integer not null,
  status public.competitor_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, competition_number)
);

-- Competitor images (scalable individual rows)
create table if not exists public.competitor_images (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  image_url text not null,
  image_type public.image_type not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competitor_id, image_type)
);

-- Votes (one email per competition)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  voter_name text not null,
  voter_email text not null,
  email_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, voter_email)
);

-- Pending vote OTP challenges (vote saved only after verification)
create table if not exists public.vote_challenges (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  voter_name text not null,
  voter_email text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_competitors_competition_id
  on public.competitors (competition_id);
create index if not exists idx_competitors_status
  on public.competitors (status);
create index if not exists idx_competitor_images_competitor_id
  on public.competitor_images (competitor_id);
create index if not exists idx_votes_competition_id
  on public.votes (competition_id);
create index if not exists idx_votes_competitor_id
  on public.votes (competitor_id);
create index if not exists idx_votes_voter_email
  on public.votes (voter_email);
create index if not exists idx_votes_created_at
  on public.votes (created_at desc);
create index if not exists idx_competitions_status
  on public.competitions (status);
create index if not exists idx_vote_challenges_email
  on public.vote_challenges (competition_id, voter_email);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists competitions_set_updated_at on public.competitions;
create trigger competitions_set_updated_at
  before update on public.competitions
  for each row execute function public.set_updated_at();

drop trigger if exists competitors_set_updated_at on public.competitors;
create trigger competitors_set_updated_at
  before update on public.competitors
  for each row execute function public.set_updated_at();

drop trigger if exists competitor_images_set_updated_at on public.competitor_images;
create trigger competitor_images_set_updated_at
  before update on public.competitor_images
  for each row execute function public.set_updated_at();

drop trigger if exists votes_set_updated_at on public.votes;
create trigger votes_set_updated_at
  before update on public.votes
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is current user an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Normalize email helper
create or replace function public.normalize_email(email text)
returns text
language sql
immutable
as $$
  select lower(trim(email));
$$;

-- Secure vote insert (service role / server only recommended)
create or replace function public.submit_verified_vote(
  p_competition_id uuid,
  p_competitor_id uuid,
  p_voter_name text,
  p_voter_email text
)
returns public.votes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_competition public.competitions%rowtype;
  v_competitor public.competitors%rowtype;
  v_email text;
  v_vote public.votes%rowtype;
begin
  v_email := public.normalize_email(p_voter_email);

  if v_email is null or v_email = '' then
    raise exception 'INVALID_EMAIL';
  end if;

  select * into v_competition
  from public.competitions
  where id = p_competition_id;

  if not found then
    raise exception 'COMPETITION_NOT_FOUND';
  end if;

  if v_competition.status <> 'active' then
    raise exception 'VOTING_CLOSED';
  end if;

  select * into v_competitor
  from public.competitors
  where id = p_competitor_id
    and competition_id = p_competition_id
    and status = 'published';

  if not found then
    raise exception 'COMPETITOR_NOT_FOUND';
  end if;

  insert into public.votes (
    competition_id,
    competitor_id,
    voter_name,
    voter_email,
    email_verified
  )
  values (
    p_competition_id,
    p_competitor_id,
    trim(p_voter_name),
    v_email,
    true
  )
  returning * into v_vote;

  return v_vote;
exception
  when unique_violation then
    raise exception 'EMAIL_ALREADY_VOTED';
end;
$$;

revoke all on function public.submit_verified_vote(uuid, uuid, text, text) from public;
grant execute on function public.submit_verified_vote(uuid, uuid, text, text) to service_role;

-- Results view for admins / public when enabled
create or replace view public.competition_results
with (security_invoker = true)
as
select
  c.competition_id,
  c.id as competitor_id,
  c.full_name,
  c.barber_name,
  c.competition_number,
  c.profile_photo_url,
  count(v.id)::integer as total_votes,
  case
    when sum(count(v.id)) over (partition by c.competition_id) = 0 then 0
    else round(
      (count(v.id)::numeric * 100)
      / nullif(sum(count(v.id)) over (partition by c.competition_id), 0),
      2
    )
  end as vote_percentage
from public.competitors c
left join public.votes v on v.competitor_id = c.id
where c.status = 'published'
group by
  c.competition_id,
  c.id,
  c.full_name,
  c.barber_name,
  c.competition_number,
  c.profile_photo_url;

-- Storage bucket for competitor images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'competitor-images',
  'competitor-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS
alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_images enable row level security;
alter table public.votes enable row level security;
alter table public.vote_challenges enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Competitions: public can read non-draft
drop policy if exists "Public read published competitions" on public.competitions;
create policy "Public read published competitions"
  on public.competitions for select
  using (
    status in ('upcoming', 'active', 'closed', 'completed')
    or public.is_admin()
  );

drop policy if exists "Admins manage competitions" on public.competitions;
create policy "Admins manage competitions"
  on public.competitions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Competitors: public can read published in visible competitions
drop policy if exists "Public read published competitors" on public.competitors;
create policy "Public read published competitors"
  on public.competitors for select
  using (
    (
      status = 'published'
      and exists (
        select 1 from public.competitions comp
        where comp.id = competition_id
          and comp.status in ('upcoming', 'active', 'closed', 'completed')
      )
    )
    or public.is_admin()
  );

drop policy if exists "Admins manage competitors" on public.competitors;
create policy "Admins manage competitors"
  on public.competitors for all
  using (public.is_admin())
  with check (public.is_admin());

-- Images follow competitor visibility
drop policy if exists "Public read competitor images" on public.competitor_images;
create policy "Public read competitor images"
  on public.competitor_images for select
  using (
    exists (
      select 1
      from public.competitors c
      join public.competitions comp on comp.id = c.competition_id
      where c.id = competitor_id
        and (
          (c.status = 'published' and comp.status in ('upcoming', 'active', 'closed', 'completed'))
          or public.is_admin()
        )
    )
  );

drop policy if exists "Admins manage competitor images" on public.competitor_images;
create policy "Admins manage competitor images"
  on public.competitor_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Votes: public cannot read voter emails; admins can
drop policy if exists "Admins read votes" on public.votes;
create policy "Admins read votes"
  on public.votes for select
  using (public.is_admin());

-- No direct public inserts — votes go through service role / submit_verified_vote
drop policy if exists "No public vote inserts" on public.votes;
-- intentionally no insert/update/delete for anon/authenticated except admin delete if needed

drop policy if exists "Admins manage votes" on public.votes;
create policy "Admins manage votes"
  on public.votes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Vote challenges: no public access (server/service role only)
drop policy if exists "Admins read vote challenges" on public.vote_challenges;
create policy "Admins read vote challenges"
  on public.vote_challenges for select
  using (public.is_admin());

-- Storage policies
drop policy if exists "Public read competitor images storage" on storage.objects;
create policy "Public read competitor images storage"
  on storage.objects for select
  using (bucket_id = 'competitor-images');

drop policy if exists "Admins upload competitor images" on storage.objects;
create policy "Admins upload competitor images"
  on storage.objects for insert
  with check (bucket_id = 'competitor-images' and public.is_admin());

drop policy if exists "Admins update competitor images" on storage.objects;
create policy "Admins update competitor images"
  on storage.objects for update
  using (bucket_id = 'competitor-images' and public.is_admin());

drop policy if exists "Admins delete competitor images" on storage.objects;
create policy "Admins delete competitor images"
  on storage.objects for delete
  using (bucket_id = 'competitor-images' and public.is_admin());

-- Promote first admin (run manually after creating your auth user):
-- update public.profiles set role = 'admin' where email = 'your-admin@email.com';
