-- Ez2Earn Supabase schema
-- Run this file in Supabase SQL Editor before enabling the remote backend.
-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY on the server only; never expose it in frontend code.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.app_accounts (
  member_code text primary key,
  email text not null unique,
  nickname text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  password_salt text,
  password_hash text,
  email_verified boolean not null default false,
  disabled boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_vaults (
  member_code text primary key references public.app_accounts(member_code) on delete cascade,
  encrypted_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoice_documents (
  invoice_id text primary key,
  owner_member_code text not null references public.app_accounts(member_code) on delete cascade,
  access_list jsonb not null default '[]'::jsonb,
  encrypted_payload jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoice_notifications (
  id text primary key,
  to_member_code text not null references public.app_accounts(member_code) on delete cascade,
  from_member_code text references public.app_accounts(member_code) on delete set null,
  invoice_id text references public.invoice_documents(invoice_id) on delete cascade,
  type text not null,
  title text not null default '',
  message text not null default '',
  read boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invite_history (
  id uuid primary key default gen_random_uuid(),
  owner_member_code text not null references public.app_accounts(member_code) on delete cascade,
  target_member_code text references public.app_accounts(member_code) on delete set null,
  target_email text not null default '',
  target_nickname text not null default '',
  last_role text not null default 'editor' check (last_role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoice_message_reads (
  member_code text not null references public.app_accounts(member_code) on delete cascade,
  invoice_id text not null references public.invoice_documents(invoice_id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  primary key (member_code, invoice_id)
);

create index if not exists app_accounts_email_idx on public.app_accounts (lower(email));
create index if not exists invoice_documents_owner_idx on public.invoice_documents (owner_member_code);
create index if not exists invoice_documents_access_gin_idx on public.invoice_documents using gin (access_list);
create index if not exists invoice_documents_metadata_gin_idx on public.invoice_documents using gin (metadata);
create index if not exists invoice_notifications_member_idx on public.invoice_notifications (to_member_code, read, created_at desc);
create index if not exists invite_history_owner_idx on public.invite_history (owner_member_code, updated_at desc);

alter table public.app_accounts enable row level security;
alter table public.user_vaults enable row level security;
alter table public.invoice_documents enable row level security;
alter table public.invoice_notifications enable row level security;
alter table public.invite_history enable row level security;
alter table public.invoice_message_reads enable row level security;

drop trigger if exists set_app_accounts_updated_at on public.app_accounts;
create trigger set_app_accounts_updated_at
before update on public.app_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_user_vaults_updated_at on public.user_vaults;
create trigger set_user_vaults_updated_at
before update on public.user_vaults
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_documents_updated_at on public.invoice_documents;
create trigger set_invoice_documents_updated_at
before update on public.invoice_documents
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_notifications_updated_at on public.invoice_notifications;
create trigger set_invoice_notifications_updated_at
before update on public.invoice_notifications
for each row execute function public.set_updated_at();

drop trigger if exists set_invite_history_updated_at on public.invite_history;
create trigger set_invite_history_updated_at
before update on public.invite_history
for each row execute function public.set_updated_at();
