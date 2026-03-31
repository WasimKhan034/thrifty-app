create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Thrift Store', 'Vintage Shop', 'Flea Market', 'Pop-Up', 'Cinema', 'Coffee Shop', 'Destination')),
  city text not null,
  region text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  website text,
  tags text[] not null default '{}',
  price text not null,
  description text not null,
  best_for text not null,
  status text not null default 'pending' check (status in ('approved', 'pending', 'rejected')),
  submitted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  added_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  would_return boolean not null default true,
  vintage_depth smallint not null check (vintage_depth between 1 and 5),
  price_luck smallint not null check (price_luck between 1 and 5),
  selection_depth smallint not null check (selection_depth between 1 and 5),
  curation smallint not null check (curation between 1 and 5),
  access smallint not null check (access between 1 and 5),
  vibe smallint not null check (vibe between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, spot_id)
);

create table if not exists public.visited_spots (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, spot_id)
);

alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.visited_spots enable row level security;

create policy "profiles readable by owner or admin"
on public.profiles
for select
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

create policy "profiles insert self"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "approved spots are public"
on public.spots
for select
using (
  status = 'approved'
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "members submit pending spots"
on public.spots
for insert
with check (
  auth.uid() = submitted_by
  and status = 'pending'
);

create policy "admins moderate spots"
on public.spots
for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "approved spot reviews are public"
on public.reviews
for select
using (true);

create policy "members can create their own reviews"
on public.reviews
for insert
with check (auth.uid() = author_id);

create policy "members can update their own reviews"
on public.reviews
for update
using (auth.uid() = author_id);

create policy "members can delete their own reviews"
on public.reviews
for delete
using (auth.uid() = author_id);

create policy "members manage their favorites"
on public.favorites
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "members manage their visited spots"
on public.visited_spots
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);
