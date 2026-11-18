-- Newsletter schema for Supabase (run in the SQL editor).
-- Safe to run more than once: it only creates what is missing.

create extension if not exists pgcrypto;

-- ==========================================
-- SUBSCRIBERS
-- ==========================================

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'subscribed',
  token_version integer not null default 0,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers
  add column if not exists status text not null default 'subscribed',
  add column if not exists token_version integer not null default 0,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

-- Required: concurrent sign-ups rely on the unique violation (23505).
create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (email);

create index if not exists newsletter_subscribers_status_created_idx
  on public.newsletter_subscribers (status, created_at);

-- ==========================================
-- CAMPAIGNS
-- ==========================================

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_campaigns
  add column if not exists preview_text text not null default '',
  add column if not exists content text not null default '',
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists sections jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'draft',
  add column if not exists is_published boolean not null default false,
  add column if not exists created_by uuid,
  add column if not exists published_by uuid,
  add column if not exists sent_by uuid,
  add column if not exists published_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists recipient_count integer not null default 0,
  add column if not exists sent_count integer not null default 0,
  add column if not exists failed_count integer not null default 0,
  add column if not exists last_error text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists newsletter_campaigns_created_idx
  on public.newsletter_campaigns (created_at desc);

-- ==========================================
-- DELIVERIES (one row per campaign x subscriber)
-- ==========================================

create table if not exists public.newsletter_campaign_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null
    references public.newsletter_campaigns (id) on delete cascade,
  subscriber_id uuid not null
    references public.newsletter_subscribers (id) on delete cascade,
  email text not null,
  status text not null default 'pending',
  attempted_at timestamptz,
  delivered_at timestamptz,
  resend_email_id text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_campaign_deliveries
  add column if not exists attempted_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists resend_email_id text,
  add column if not exists error_message text;

-- Required: guarantees nobody is emailed twice for the same campaign.
create unique index if not exists newsletter_deliveries_campaign_subscriber_unique
  on public.newsletter_campaign_deliveries (campaign_id, subscriber_id);
