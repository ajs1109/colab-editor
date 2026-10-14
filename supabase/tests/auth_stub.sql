-- Minimal emulation of what a Supabase project provides before our migrations run,
-- so they can be applied and tested against a plain local PostgreSQL.
-- Loaded first by scripts/db-test.sh; not used against the hosted database.
--
-- Provides:
--   * roles anon, authenticated, service_role (nologin), with Supabase-like grants
--     on schema public (including default privileges for tables created later);
--   * schema auth with a minimal auth.users table and auth.uid() / auth.role() /
--     auth.jwt(), which read the request.jwt.claim.* settings like Supabase does;
--   * extensions pgcrypto and citext (if available) in schema "extensions",
--     which is on the database search_path as on Supabase;
--   * test helpers in schema "tests".
--
-- Usage inside a *.test.sql file (each file runs as the superuser, wrapped in
-- BEGIN ... ROLLBACK so nothing persists):
--
--   begin;
--   insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'a@x.io');
--   select tests.login_as('11111111-1111-1111-1111-111111111111');  -- role authenticated, auth.uid() = that id
--   ... queries run under RLS as that user ...
--   select tests.login_anon();                                       -- role anon, auth.uid() is null
--   select tests.logout();                                           -- back to the superuser
--   rollback;
--
-- All helpers use SET LOCAL semantics, so they only last until the end of the
-- current transaction.

-- Roles ---------------------------------------------------------------------

do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated', 'service_role'] loop
    if not exists (select 1 from pg_roles where rolname = r) then
      execute format('create role %I nologin noinherit', r);
    end if;
  end loop;
end
$$;

alter role service_role bypassrls;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Extensions ----------------------------------------------------------------

create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'citext') then
    create extension if not exists citext with schema extensions;
  else
    raise notice 'citext extension not available; skipping';
  end if;
end
$$;

do $$
begin
  execute format('alter database %I set search_path = "$user", public, extensions', current_database());
end
$$;
set search_path = "$user", public, extensions;

-- auth schema ---------------------------------------------------------------

create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;

grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;

-- Test helpers --------------------------------------------------------------

create schema if not exists tests;
grant usage on schema tests to anon, authenticated, service_role;

-- Act as a signed-in user for the rest of the transaction.
create or replace function tests.login_as(user_id uuid) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end
$$;

-- Act as an anonymous visitor for the rest of the transaction.
create or replace function tests.login_anon() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claims', jsonb_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end
$$;

-- Return to the superuser (no RLS, no JWT claims).
create or replace function tests.logout() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'none', true);
end
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;
