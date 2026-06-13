-- Latimore Life & Legacy Virtual Interactive Intake - initial schema

create extension if not exists pgcrypto;

create table leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  state text,
  source text default 'latimore_virtual_intake',
  journey text not null check (journey in ('client', 'business_partner', 'both')),
  created_at timestamptz default now()
);

create table intake_profiles (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  marital_status text,
  spouse_name text,
  age_range text,
  smoker boolean,
  has_children boolean,
  children_ages text,
  occupation text,
  family_notes text,
  recreation_notes text,
  motivation_notes text,
  created_at timestamptz default now()
);

create table financial_intake (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,

  monthly_income numeric(12,2),
  monthly_expenses numeric(12,2),
  emergency_fund numeric(12,2),
  market_assets numeric(12,2),

  has_employer_retirement boolean,
  retirement_plan_types text[],
  retirement_balance numeric(12,2),
  retirement_contribution numeric(12,2),
  contribution_frequency text check (contribution_frequency in ('per_check', 'monthly', 'annual')),
  has_company_match boolean,
  company_match_details text,

  has_life_insurance boolean,
  life_insurance_source text check (life_insurance_source in ('work', 'outside_work', 'both', 'none')),
  coverage_amount numeric(12,2),
  premium_amount numeric(12,2),
  premium_frequency text check (premium_frequency in ('monthly', 'annual')),
  policy_type text check (policy_type in ('term', 'permanent', 'unknown')),
  has_living_benefits boolean,
  has_ltc boolean,

  tax_status text check (tax_status in ('refund', 'owe', 'break_even', 'unknown')),
  tax_amount numeric(12,2),

  min_monthly_savings numeric(12,2),
  max_monthly_savings numeric(12,2),

  has_outside_retirement boolean,
  has_children boolean,
  children_ages text,
  saving_for_children boolean,
  additional_income_interest boolean,

  created_at timestamptz default now()
);

create table client_priorities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  priority text not null check (
    priority in (
      'tax_advantage',
      'asset_protection',
      'college_funding',
      'debt_management',
      'infinite_banking',
      'life_insurance',
      'estate_planning',
      'indexed_growth',
      'mortgage_protection',
      'business_owner_strategies'
    )
  ),
  importance_rank int,
  why_important text
);

create table dime_calculations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,

  debt numeric(12,2) default 0,
  annual_income numeric(12,2) default 0,
  income_multiplier int default 10,
  mortgage_balance numeric(12,2) default 0,
  education_goal numeric(12,2) default 0,
  current_coverage numeric(12,2) default 0,

  calculated_need numeric(12,2) generated always as
    (debt + (annual_income * income_multiplier) + mortgage_balance + education_goal) stored,

  coverage_gap numeric(12,2) generated always as
    (greatest((debt + (annual_income * income_multiplier) + mortgage_balance + education_goal) - current_coverage, 0)) stored,

  created_at timestamptz default now()
);

create table intake_scores (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  client_score int not null,
  advisor_score int not null,
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  recommended_tracks text[],
  summary text,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  channel text not null check (channel in ('email', 'google_chat')),
  status text not null check (status in ('pending', 'sent', 'failed')),
  payload jsonb,
  error_message text,
  created_at timestamptz default now()
);

create table booking_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  booking_url text not null,
  clicked_at timestamptz,
  booking_confirmed_at timestamptz,
  created_at timestamptz default now()
);

-- Row Level Security
alter table leads enable row level security;
alter table intake_profiles enable row level security;
alter table financial_intake enable row level security;
alter table client_priorities enable row level security;
alter table dime_calculations enable row level security;
alter table intake_scores enable row level security;
alter table notifications enable row level security;
alter table booking_events enable row level security;

-- Public (anon) can only INSERT new intake data, never read/update/delete.
-- All inserts in this app go through the service role on the server, so no
-- anon policies are created here; the service role bypasses RLS entirely.
-- Authenticated admin users (Jackson) can read everything.
create policy "Admins can read leads" on leads
  for select using (auth.role() = 'authenticated');

create policy "Admins can read intake_profiles" on intake_profiles
  for select using (auth.role() = 'authenticated');

create policy "Admins can read financial_intake" on financial_intake
  for select using (auth.role() = 'authenticated');

create policy "Admins can read client_priorities" on client_priorities
  for select using (auth.role() = 'authenticated');

create policy "Admins can read dime_calculations" on dime_calculations
  for select using (auth.role() = 'authenticated');

create policy "Admins can read intake_scores" on intake_scores
  for select using (auth.role() = 'authenticated');

create policy "Admins can read notifications" on notifications
  for select using (auth.role() = 'authenticated');

create policy "Admins can read booking_events" on booking_events
  for select using (auth.role() = 'authenticated');

create policy "Admins can update booking_events" on booking_events
  for update using (auth.role() = 'authenticated');

create index on leads (created_at desc);
create index on intake_profiles (lead_id);
create index on financial_intake (lead_id);
create index on client_priorities (lead_id);
create index on dime_calculations (lead_id);
create index on intake_scores (lead_id);
create index on notifications (lead_id);
create index on booking_events (lead_id);
