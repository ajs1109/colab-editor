-- Versioned file storage used by the repository view, editor and commit history.
--
-- Model: every commit stores a row in file_tree only for the paths it touched.
-- The state of a project at commit C is, for every path, the newest file_tree
-- row at or before C; rows with is_deleted = true are tombstones and hide the path.
--
-- Safe to run on an existing database: every statement is idempotent.

create table if not exists public.commits (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  message          text not null,
  committer_id     uuid references public.users (id) on delete set null,
  parent_commit_id uuid references public.commits (id) on delete set null,
  committed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz
);

create table if not exists public.file_tree (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  commit_id  uuid not null references public.commits (id) on delete cascade,
  path       text not null,
  name       text not null,
  type       text not null check (type in ('file', 'dir')),
  content    text,
  size       integer default 0,
  extension  text,
  mime_type  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.file_tree
  add column if not exists is_deleted boolean not null default false;

create table if not exists public.file_changes (
  id          uuid primary key default gen_random_uuid(),
  commit_id   uuid not null references public.commits (id) on delete cascade,
  file_id     uuid references public.file_tree (id) on delete set null,
  change_type text not null check (change_type in ('added', 'modified', 'deleted', 'renamed')),
  old_path    text,
  new_path    text,
  old_content text,
  new_content text,
  additions   integer default 0,
  deletions   integer default 0,
  created_at  timestamptz not null default now()
);

create unique index if not exists file_tree_path_commit_id_key
  on public.file_tree (path, commit_id);
create index if not exists file_tree_project_id_idx on public.file_tree (project_id);
create index if not exists commits_project_id_committed_at_idx
  on public.commits (project_id, committed_at desc);
create index if not exists file_changes_commit_id_idx on public.file_changes (commit_id);

-- Earlier versions stored editor saves with a leading slash ("/src/a.ts") and
-- explorer entries without one ("src/a.ts"). Normalise to the slash-less form.
update public.file_tree
   set path = regexp_replace(path, '^/+', '')
 where path like '/%'
   and not exists (
     select 1 from public.file_tree t2
      where t2.commit_id = file_tree.commit_id
        and t2.path = regexp_replace(file_tree.path, '^/+', '')
   );
update public.file_changes set new_path = regexp_replace(new_path, '^/+', '') where new_path like '/%';
update public.file_changes set old_path = regexp_replace(old_path, '^/+', '') where old_path like '/%';
