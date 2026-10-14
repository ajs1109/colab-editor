-- Baseline: the core tables that already exist in the hosted Supabase database.
--
-- users, projects and project_members were created by hand in the Supabase
-- dashboard and were never part of a migration, yet 0001_versioned_files.sql
-- references them. This file mirrors the live schema (columns, types, nullability,
-- defaults, primary/foreign keys) as captured in the generated types
-- (src/types/database.ts) and the old dashboard dump (src/supabase/definitions.sql),
-- so a blank database can apply every migration in order.
--
-- It deliberately adds nothing new: no RLS, policies, checks or unique rules
-- beyond what the live database already has (those come in later migrations).
--
-- Safe to run on the existing database: every statement is idempotent, so on the
-- hosted project it is a no-op.

create table if not exists public.users (
  id          uuid not null,
  created_at  timestamptz not null default now(),
  email       text,
  name        text,
  description text,
  avatar      varchar,
  updated_at  timestamptz,
  links       jsonb[],
  provider    text,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade
);

create table if not exists public.projects (
  id          uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz,
  name        text,
  description text,
  readme      text,
  created_by  uuid,
  closed      boolean,
  is_public   boolean default false,
  constraint projects_pkey primary key (id),
  constraint projects_created_by_fkey foreign key (created_by) references auth.users (id) on delete cascade,
  constraint projects_created_by_fkey1 foreign key (created_by) references public.users (id) on delete cascade
);

-- is_public was added to the live table after the original dump.
alter table public.projects
  add column if not exists is_public boolean default false;

create table if not exists public.project_members (
  created_at         timestamptz not null default now(),
  project_id         uuid,
  user_id            uuid,
  role               text,
  "invitationStatus" text,
  invited_at         timestamptz,
  joined_at          timestamptz,
  id                 uuid not null default gen_random_uuid(),
  updated_at         timestamptz,
  constraint project_members_pkey primary key (id),
  constraint project_members_id_key unique (id),
  constraint project_members_project_id_fkey foreign key (project_id) references public.projects (id) on delete cascade,
  constraint project_members_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint project_members_user_id_fkey1 foreign key (user_id) references public.users (id) on delete cascade
);
