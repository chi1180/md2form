alter table public.user_profiles
  add column if not exists stripe_customer_id text unique;

alter table public.user_profiles
  add column if not exists stripe_subscription_id text unique;

alter table public.user_profiles
  add column if not exists billing_status text not null default 'none';

alter table public.user_profiles
  add column if not exists current_period_end timestamptz;
