-- Smoke test: every migration applied and the auth stub behaves like Supabase.
begin;

do $$
declare
  t text;
begin
  foreach t in array array['users', 'projects', 'project_members', 'commits', 'file_tree', 'file_changes'] loop
    if to_regclass('public.' || t) is null then
      raise exception 'expected table public.% to exist', t;
    end if;
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'projects' and column_name = 'is_public'
  ) then
    raise exception 'expected column public.projects.is_public';
  end if;

  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'file_tree' and column_name = 'is_deleted'
  ) then
    raise exception 'expected column public.file_tree.is_deleted';
  end if;

  if not exists (
    select 1 from pg_indexes
     where schemaname = 'public' and tablename = 'file_tree'
       and indexname = 'file_tree_path_commit_id_key'
  ) then
    raise exception 'expected unique index file_tree_path_commit_id_key';
  end if;
end
$$;

-- tests.login_as switches role and makes auth.uid() return the given id.
select tests.login_as('11111111-1111-1111-1111-111111111111');
do $$
begin
  if auth.uid() is distinct from '11111111-1111-1111-1111-111111111111'::uuid then
    raise exception 'auth.uid() returned %, expected 1111...', auth.uid();
  end if;
  if auth.role() is distinct from 'authenticated' then
    raise exception 'auth.role() returned %, expected authenticated', auth.role();
  end if;
  if current_user <> 'authenticated' then
    raise exception 'current_user is %, expected authenticated', current_user;
  end if;
end
$$;

-- tests.login_anon clears the user.
select tests.login_anon();
do $$
begin
  if auth.uid() is not null then
    raise exception 'auth.uid() should be null for anon, got %', auth.uid();
  end if;
  if current_user <> 'anon' then
    raise exception 'current_user is %, expected anon', current_user;
  end if;
end
$$;

-- tests.logout returns to the superuser.
select tests.logout();
do $$
begin
  if auth.uid() is not null or current_user in ('anon', 'authenticated') then
    raise exception 'logout did not reset the session (user %, uid %)', current_user, auth.uid();
  end if;
end
$$;

rollback;
