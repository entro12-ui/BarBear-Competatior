-- Barbear local PostgreSQL schema
-- Apply with: npm run db:setup

create extension if not exists "pgcrypto";

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

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  full_name text not null,
  barber_name text not null,
  profile_photo_url text,
  profile_photo_bytes bytea,
  profile_photo_mime text,
  short_bio text not null default '',
  description text not null default '',
  phone text,
  competition_number integer not null,
  status public.competitor_status not null default 'draft',
  instagram_url text,
  tiktok_url text,
  facebook_url text,
  youtube_url text,
  telegram_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, competition_number)
);

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

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  voter_name text not null,
  voter_email text not null,
  voter_phone text not null,
  email_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, voter_email),
  unique (competition_id, voter_phone)
);

create table if not exists public.vote_challenges (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  voter_name text not null,
  voter_email text not null,
  voter_phone text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_competitors_competition_id on public.competitors (competition_id);
create index if not exists idx_competitor_images_competitor_id on public.competitor_images (competitor_id);
create index if not exists idx_votes_competition_id on public.votes (competition_id);
create index if not exists idx_votes_competitor_id on public.votes (competitor_id);
create index if not exists idx_votes_voter_email on public.votes (voter_email);
create index if not exists idx_votes_voter_phone on public.votes (voter_phone);
create index if not exists idx_vote_challenges_email on public.vote_challenges (competition_id, voter_email);
create index if not exists idx_vote_challenges_phone on public.vote_challenges (competition_id, voter_phone);

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
