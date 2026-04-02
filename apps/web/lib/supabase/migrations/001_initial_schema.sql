-- Walter Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quiz Responses
create table public.quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  planning_mode text not null check (planning_mode in ('destination', 'timeline')),
  destinations text[],
  flexible_dates boolean default false,
  start_date date,
  end_date date,
  trip_duration_days integer,
  travelers_count integer default 1,
  traveler_type text check (traveler_type in ('solo', 'couple', 'family', 'friends', 'business')),
  children_count integer default 0,
  children_ages integer[],
  budget_mode text check (budget_mode in ('total_trip', 'per_day')),
  budget_amount decimal(10,2),
  budget_currency text default 'USD',
  flight_preference text check (flight_preference in ('economy', 'premium_economy', 'business', 'first', 'no_preference')),
  flight_priority text check (flight_priority in ('cheapest', 'shortest', 'best_value', 'fewest_stops')),
  accommodation_type text[] default '{}',
  activity_interests text[] default '{}',
  dining_preference text check (dining_preference in ('budget', 'mid_range', 'fine_dining', 'mixed')),
  pace text check (pace in ('relaxed', 'moderate', 'packed')),
  accessibility_needs text[],
  special_requests text,
  departure_city text,
  created_at timestamptz default now()
);

-- Generated Trips
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  quiz_response_id uuid references public.quiz_responses(id),
  title text not null,
  summary text,
  destination text not null,
  tier text default 'balanced' check (tier in ('budget', 'balanced', 'premium')),
  start_date date,
  end_date date,
  total_estimated_cost decimal(10,2),
  currency text default 'USD',
  status text default 'draft' check (status in ('draft', 'saved', 'booked', 'completed', 'archived')),
  ai_model_used text,
  ai_prompt_tokens integer,
  ai_completion_tokens integer,
  cover_image_url text,
  is_public boolean default false,
  share_slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trip Days
create table public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  day_number integer not null,
  date date,
  title text,
  summary text,
  estimated_cost decimal(10,2),
  weather_forecast jsonb,
  created_at timestamptz default now()
);

-- Trip Items (bookable items within a day)
create table public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid references public.trip_days(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  item_type text not null check (item_type in ('flight', 'hotel', 'rental', 'activity', 'restaurant', 'event', 'transport', 'note')),
  title text not null,
  description text,
  start_time time,
  end_time time,
  duration_minutes integer,
  estimated_cost decimal(10,2),
  booking_url text,
  affiliate_provider text,
  external_id text,
  location_name text,
  location_lat decimal(10,7),
  location_lng decimal(10,7),
  rating decimal(3,1),
  image_url text,
  metadata jsonb,
  sort_order integer,
  is_booked boolean default false,
  booking_confirmation text,
  created_at timestamptz default now()
);

-- Saved Trips
create table public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, trip_id)
);

-- Trip Comparisons
create table public.trip_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text,
  trip_ids uuid[] not null,
  created_at timestamptz default now()
);

-- Affiliate Click Tracking
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  trip_id uuid references public.trips(id),
  trip_item_id uuid references public.trip_items(id),
  provider text not null,
  click_url text not null,
  clicked_at timestamptz default now()
);

-- User Preferences
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique,
  preferred_airlines text[],
  preferred_hotel_chains text[],
  dietary_restrictions text[],
  home_airport text,
  passport_country text,
  preferred_currency text default 'USD',
  travel_style jsonb,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.trips enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_items enable row level security;
alter table public.saved_trips enable row level security;
alter table public.trip_comparisons enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.user_preferences enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create policy "Users can read own quiz responses" on public.quiz_responses for select using (auth.uid() = user_id);
create policy "Users can insert own quiz responses" on public.quiz_responses for insert with check (auth.uid() = user_id);

create policy "Users can read own trips" on public.trips for select using (auth.uid() = user_id or is_public = true);
create policy "Users can insert own trips" on public.trips for insert with check (auth.uid() = user_id);
create policy "Users can update own trips" on public.trips for update using (auth.uid() = user_id);

create policy "Users can read own trip days" on public.trip_days for select using (
  exists (select 1 from public.trips where trips.id = trip_days.trip_id and (trips.user_id = auth.uid() or trips.is_public = true))
);

create policy "Users can read own trip items" on public.trip_items for select using (
  exists (select 1 from public.trips where trips.id = trip_items.trip_id and (trips.user_id = auth.uid() or trips.is_public = true))
);

create policy "Users can read own saved trips" on public.saved_trips for select using (auth.uid() = user_id);
create policy "Users can insert own saved trips" on public.saved_trips for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved trips" on public.saved_trips for delete using (auth.uid() = user_id);

create policy "Users can read own comparisons" on public.trip_comparisons for select using (auth.uid() = user_id);
create policy "Users can insert own comparisons" on public.trip_comparisons for insert with check (auth.uid() = user_id);

create policy "Users can insert own clicks" on public.affiliate_clicks for insert with check (auth.uid() = user_id);

create policy "Users can read own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can upsert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);

-- Auto-create user row when they sign up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
