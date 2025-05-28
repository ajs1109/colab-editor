-- Drop existing tables if they exist
drop table if exists public.task_labels cascade;
drop table if exists public.task_assignees cascade;
drop table if exists public.activities cascade;
drop table if exists public.comments cascade;
drop table if exists public.tasks cascade;
drop table if exists public.statuses cascade;
drop table if exists public.sizes cascade;
drop table if exists public.priorities cascade;
drop table if exists public.labels cascade;
drop table if exists public.project_members cascade;
drop table if exists public.projects cascade;
drop table if exists public.users cascade;

-- Create tables in dependency order
create table public.users (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  email text null,
  name text null,
  description text null,
  avatar character varying null,
  updated_at timestamp with time zone null,
  links jsonb[] null,
  provider text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.projects (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  name text null,
  description text null,
  readme text null,
  created_by uuid null,
  closed boolean null,
  constraint projects_pkey primary key (id),
  constraint projects_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete CASCADE,
  constraint projects_created_by_fkey1 foreign KEY (created_by) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.project_members (
  created_at timestamp with time zone not null default now(),
  project_id uuid null,
  user_id uuid null,
  role text null,
  "invitationStatus" text null,
  invited_at timestamp with time zone null,
  joined_at timestamp with time zone null,
  id uuid not null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  constraint project_members_pkey primary key (id),
  constraint project_members_id_key unique (id),
  constraint project_members_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE,
  constraint project_members_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint project_members_user_id_fkey1 foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.labels (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  label text null,
  description text null,
  color text null,
  project_id uuid null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  constraint labels_pkey primary key (id),
  constraint labels_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.priorities (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  label text null,
  description text null,
  color text null,
  project_id uuid null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  "order" numeric null,
  constraint priorities_pkey primary key (id),
  constraint priorities_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.sizes (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  label text null,
  description text null,
  color text null,
  project_id uuid null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  "order" numeric null,
  constraint sizes_pkey primary key (id),
  constraint sizes_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.statuses (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  label text null,
  description text null,
  color text null,
  project_id uuid null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  "order" numeric null,
  "limit" numeric null,
  constraint statuses_pkey primary key (id),
  constraint statuses_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.tasks (
  created_at timestamp with time zone not null default now(),
  project_id uuid null,
  status_id uuid null,
  created_by uuid null,
  updated_at timestamp with time zone null,
  title text null,
  description text null,
  priority uuid null,
  size uuid null,
  "startDate" timestamp with time zone null,
  "endDate" timestamp with time zone null,
  id uuid not null default gen_random_uuid (),
  "statusPosition" numeric null,
  constraint tasks_pkey primary key (id),
  constraint tasks_id_key unique (id),
  constraint tasks_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE,
  constraint tasks_size_fkey foreign KEY (size) references sizes (id) on delete set null,
  constraint tasks_status_id_fkey foreign KEY (status_id) references statuses (id) on delete CASCADE,
  constraint tasks_priority_fkey foreign KEY (priority) references priorities (id) on delete set null,
  constraint tasks_created_by_fkey foreign KEY (created_by) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.activities (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  task_id uuid null,
  user_id uuid null,
  content jsonb[] null,
  updated_at timestamp with time zone null,
  constraint activities_pkey primary key (id),
  constraint activities_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE,
  constraint activities_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.comments (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  task_id uuid null,
  user_id uuid null,
  content text null,
  constraint comments_pkey primary key (id),
  constraint comments_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE,
  constraint comments_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.task_assignees (
  created_at timestamp with time zone not null default now(),
  task_id uuid null,
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  updated_at timestamp with time zone null,
  constraint task_assignees_pkey primary key (id),
  constraint task_assignees_id_key unique (id),
  constraint task_assignees_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE,
  constraint task_assignees_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.task_labels (
  created_at timestamp with time zone not null default now(),
  label_id uuid null,
  task_id uuid null,
  id uuid not null default gen_random_uuid (),
  updated_at timestamp with time zone null,
  constraint task_labels_pkey primary key (id),
  constraint task_labels_id_key unique (id),
  constraint task_labels_label_id_fkey foreign KEY (label_id) references labels (id) on delete CASCADE,
  constraint task_labels_task_id_fkey foreign KEY (task_id) references tasks (id) on delete CASCADE
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS) for all tables
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.labels enable row level security;
alter table public.priorities enable row level security;
alter table public.sizes enable row level security;
alter table public.statuses enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;
alter table public.comments enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_labels enable row level security;