# Colab Editor — Roadmap to v1.0

> Single source of truth for finishing the project. Every task below is written so a
> subagent can pick it up alone: it lists the files it owns, its dependencies and its
> acceptance criteria. **Agents must stay inside their "Owns" list** so parallel work
> doesn't conflict; anything else goes in a note on the task.

## 1. Goal

Ship **Colab Editor v1.0**: a GitHub-style code hosting app where people sign in, create
repositories, browse and edit files in a VS Code-style editor **together in real time**,
and every change is preserved as a commit they can browse later.

### Definition of done (v1.0)

A new user can, on the deployed site, with no manual DB edits:

1. Sign up (email, GitHub or Google), pick a username, and upload an avatar.
2. Create a public or private repository that starts with a `README.md`.
3. Create, rename, move and delete files and folders; every action is a commit.
4. Open a file with a teammate and see each other's edits and cursors live; save with a
   commit message; never silently overwrite someone else's commit.
5. Browse commit history (paginated, filterable), view a commit's diff, and browse the
   repository as it was at any commit.
6. Invite collaborators by username or email, set roles (read / write / admin), remove
   them; invitees accept from an email link.
7. Manage the repo in Settings: rename, description, visibility, close/reopen, delete.
8. View public repositories without signing in.
9. Every table is protected by RLS; no secrets in the repo; the server never trusts a
   client-supplied user id.
10. CI runs lint, typecheck, unit tests, DB policy tests and a build on every PR.

### Out of scope for v1.0 (explicitly cut)

Branches, pull requests, issues, built-in terminal, "time-travel debugging" (the landing
page claims these; T25 removes the claims). The leftover task-board code (tasks,
labels, statuses, priorities, sizes, activities, comments) is deleted, not finished.

---

## 2. Target design

### 2.1 Frontend (Next.js 15 App Router)

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing | public |
| `/login`, `/create-account`, `/forgot-password`, `/auth/*` | Auth | public |
| `/profile/setup` | Choose username (forced once) | signed in |
| `/profile` | Edit own profile + avatar | signed in |
| `/u/[username]` | Public profile + public repos | public |
| `/projects` | Dashboard: my repos + repos I'm a member of | signed in |
| `/new-project` | Create repo | signed in |
| `/invites/[projectId]` | Accept / decline invite | signed in |
| `/[username]/[repo]` | Code tab: file tree + README render | public repo or member |
| `/[username]/[repo]/tree/[commit]/[[...path]]` | Browse at a commit | same |
| `/[username]/[repo]/edit/[...path]` | Collaborative editor (multi-file sidebar) | writer (read-only for readers) |
| `/[username]/[repo]/commits` | History: pagination, committer + date filters | same |
| `/[username]/[repo]/commit/[id]` | Commit diff | same |
| `/[username]/[repo]/settings` | General + Members + Danger zone | admin (danger zone: owner) |

Rules:
- **Server components read with the cookie-based server client** (`@/utils/supabase/server`).
  The browser client (`@/lib/apiClient`) is only for Realtime and client-side auth calls.
- **All writes go through route handlers** under `/api/**` (never direct table writes
  from the browser, never `"use server"` modules that take a user id as an argument).
- Never send `users.email` of other users to the client; select explicit columns.

### 2.2 Backend

- `src/utils/supabase/repo-files.ts` — versioned file model (exists).
- `src/server/` (new) — one module per domain: `projects.ts`, `members.ts`, `users.ts`,
  `access.ts` (`getRepoAccess`, role checks). Server-only (`import 'server-only'`).
- Route handlers (all return JSON `{ error }` with proper status; 401 not redirect):

| Method & path | Does |
|---|---|
| `POST /api/projects` | Create repo + owner membership + initial commit with README.md (atomic, via RPC) |
| `PATCH /api/repo/[u]/[r]` | Rename / description / visibility / close / reopen (admin) |
| `DELETE /api/repo/[u]/[r]` | Delete (owner) |
| `POST /api/repo/[u]/[r]/commits` | Commit changes; body gains `baseCommitId` for conflict detection (exists) |
| `GET /api/repo/[u]/[r]/files?commit=` | File list at commit (for editor sidebar) |
| `POST /api/repo/[u]/[r]/members` | Invite by username or email (admin); sends email |
| `PATCH/DELETE /api/repo/[u]/[r]/members/[userId]` | Change role / remove (admin) |
| `POST /api/invites/[projectId]` | Accept or decline (invitee) |
| `PATCH /api/profile` | Update profile; username change validated + unique |
| `POST /api/repo/[u]/[r]/run` *(optional, T16)* | Server-side proxy to code runner, rate-limited |

### 2.3 Database (Postgres / Supabase)

Migrations live in `supabase/migrations/` and are the **only** schema source.
`src/supabase/definitions.sql` and `schema*.json/md` are deleted once 0000 exists.

```
users            id (=auth.users.id) PK, name citext UNIQUE (^[a-z0-9_-]{3,20}$), email,
                 avatar, description, links jsonb, provider, created_at, updated_at
projects         id PK, name (^[a-zA-Z0-9._-]{1,100}$), description, is_public bool,
                 closed bool, created_by → users, created_at, updated_at
                 UNIQUE (created_by, lower(name))
project_members  id PK, project_id → projects, user_id → users NULL, invited_email NULL,
                 role ('read'|'write'|'admin'), "invitationStatus" ('invited'|'accepted'|'declined'),
                 invited_by, invited_at, joined_at   UNIQUE (project_id, user_id)
commits          id, project_id, message, committer_id, parent_commit_id, committed_at
file_tree        id, project_id, commit_id, path, name, type, content, size, extension,
                 mime_type, is_deleted, storage_path NULL   UNIQUE (path, commit_id)
file_changes     id, commit_id, file_id, change_type, old/new path, old/new content,
                 additions, deletions
```

SQL helpers (`security definer`, `stable`, `set search_path = public`):
`is_project_member(project_id, min_role)`, `can_read_project(project_id)` (public or member
or owner), `can_write_project(project_id)`.

RLS policies (enable on every table):
- `users`: select public columns to everyone via a `public_profiles` view (no email);
  update own row only.
- `projects`: select if `can_read_project`; insert where `created_by = auth.uid()`;
  update if admin; delete if owner.
- `project_members`: select if member of that project or the invitee; writes only
  through API (admin) — policy allows admin insert/update/delete, invitee may update own
  row's status.
- `commits`, `file_tree`, `file_changes`: select if `can_read_project`; insert if
  `can_write_project`; **no update/delete** (history is append-only).

RPCs:
- `create_project(name, description, is_public, readme)` → creates project, owner
  membership (role admin), initial commit, README.md row; atomic.
- `create_commit(project_id, message, parent_id, tree_rows jsonb, change_rows jsonb)` →
  atomic insert; rejects if `parent_id` is not the current head (conflict → 409).
- `files_at_commit(project_id, commit_id)` → `DISTINCT ON (path)` query replacing the
  JS reduction in `getFilesAtCommit` (keeps the same output shape).
- Trigger on `auth.users` insert → creates `public.users` row (replaces the fragile
  `captureUserDetails`).

### 2.4 Storage

| Bucket | Visibility | Path | Limits | Policies |
|---|---|---|---|---|
| `avatars` | public read | `{user_id}/avatar.{png,jpg,webp}` (upsert, one file) | 2 MB; png/jpeg/webp only (no SVG) | insert/update/delete only where first path segment = `auth.uid()` |
| `repo-files` *(stretch, T19)* | private | `{project_id}/{commit_id}/{path}` | 10 MB | read if `can_read_project`, write via API only |

### 2.5 Realtime

- Channel per file: `file:{projectId}:{path}` (exists, `useCollaboration`).
- v1.0 upgrade (T13): Yjs document per file synced over Supabase broadcast
  (`y-monaco` binding, state-vector handshake on join) so concurrent edits always
  converge. Presence stays as is.
- Channel per repo: `repo:{projectId}` broadcasting `commit-created` so open explorers
  and editors refresh and the editor can warn "file changed upstream".

### 2.6 Verification without the hosted Supabase

Agents cannot reach the hosted project. T00 sets up:
- **DB tests:** local Postgres 16 (installed in the dev container) + a stub `auth` schema
  (`auth.uid()` reading a session GUC, `anon`/`authenticated` roles) → run every
  migration, then pgTAP-style SQL assertions for each RLS policy and RPC.
- **Unit tests:** Vitest for `src/utils`, `src/server`, route handler validation.
- **E2E (later, T23):** Playwright against `supabase start` where Docker is available
  (CI), skipped locally if not.

The repo owner applies migrations to the hosted project and does the final click-through.

---

## 3. Timeline

Estimates assume subagents working in parallel waves and the owner reviewing/merging
and applying migrations **once a day**. The owner's review loop, not coding, is the
bottleneck.

| Wave | Calendar | Content | Exit criteria |
|---|---|---|---|
| 0 | Day 1 (Oct 15) | Secrets, test harness, dead-code purge, CI skeleton | CI green, keys rotated |
| 1 | Days 2–4 (Oct 16–20) | Schema baseline + RLS + RPCs; project creation; API lockdown; auth/user fixes | All tables under RLS; creating a repo works end to end |
| 2 | Days 5–8 (Oct 21–24) | Repo page/README, history, settings, members & invites, dashboard, public repos, profile/avatars | Definition of done items 1–3, 5–8 |
| 3 | Days 9–11 (Oct 27–29) | Yjs collaboration, conflict detection, multi-file editor, repo channel | Item 4 |
| 4 | Days 12–13 (Oct 30–31) | E2E tests, landing polish, docs, release | Item 10; v1.0 tagged |

**Target: v1.0 on Friday, Oct 31, 2026.** Realistic range Oct 29 – Nov 6 depending on
review turnaround and what turns up in the hosted DB (its live schema may differ from
what the code implies). Stretch items (T16 code runner, T19 binary files) come after v1.0.

---

## 4. Tasks (in priority order)

Size: **S** ≤ 2h agent time, **M** half day, **L** full day. "Owns" = files the task may
modify. Tasks in the same wave with disjoint "Owns" can run in parallel.

### Wave 0 — Unblock & secure (P0)

**T01 · Rotate leaked secrets** · S · *owner (human)* + agent
- Human: revoke both Resend keys (one was in `.env`, another hardcoded in
  `src/utils/emails/index.ts:3`), the `SUPABASE_ACCESS_TOKEN`; check the Supabase anon key
  is the only key ever exposed. Optionally purge history with `git filter-repo`.
- Agent: delete the hardcoded key (file is dead — removed in T03).
- Done when: no `re_` / `sbp_` / JWT literals in the tree (`git grep`), keys rotated.

**T00 · Test harness** · M · Owns: `package.json` (devDeps, scripts), `vitest.config.ts`,
`supabase/tests/**`, `scripts/db-test.sh`
- Vitest + first tests (port the existing `repo-files` scenario test).
- `scripts/db-test.sh`: starts a throwaway local Postgres 16 cluster, loads
  `supabase/tests/auth_stub.sql`, applies all migrations, runs `supabase/tests/*.sql`.
- Scripts: `test`, `test:db`, `typecheck` (`tsc --noEmit`).
- Done when: `npm test` and `npm run test:db` pass locally.

**T02 · CI** · S · Owns: `.github/workflows/ci.yml` · after T00
- Node 22: `npm ci`, lint, typecheck, `npm test`, `npm run test:db`, `next build`
  (with dummy public env vars).

**T03 · Dead-code & dependency purge** · M · Owns: only files listed as dead in the audit
(`docs/ROADMAP.md` §5)
- Delete dead files/exports, task-board code, `mock-data.ts`, unused shadcn components,
  `src/utils/emails/index.ts`, `src/types/database.ts`, `api-response.ts`, `diff.ts`,
  `lib/apiClient.ts` `AuthService`/`PermissionService`; uninstall `@dnd-kit/*`,
  `recharts`, `vaul`, `tiptap@0.15`, `npm`, move `supabase` to devDependencies.
- Done when: build + typecheck green, no import of deleted files.

### Wave 1 — Data foundation (P0)

**T04 · Schema baseline & RLS migration** · L · Owns: `supabase/migrations/0000_*.sql`,
`0002_rls.sql`, `supabase/tests/rls_*.sql`, delete `src/supabase/**` · after T00
- `0000_baseline.sql`: `create table if not exists` for users, projects (incl.
  `is_public`), project_members — matching the live DB as implied by code.
- `0002_rls.sql`: constraints from §2.3 (unique username/citext, unique repo name per
  owner, checks), helper functions, all policies, `public_profiles` view, drop task-board
  tables (guarded, separate migration `0003_drop_taskboard.sql` so the owner can skip it).
- Tests: anon can read public repo files but not private; non-member can't insert
  commits; writer can; nobody can update/delete history; users can't edit others' rows.

**T05 · Atomic RPCs** · M · Owns: `supabase/migrations/0004_rpcs.sql`,
`src/utils/supabase/repo-files.ts`, tests · after T04
- `create_project`, `create_commit` (with head check → conflict), `files_at_commit`,
  `auth.users` insert trigger. Switch `repo-files.ts` to call them (same exports).

**T06 · Lock down server code** · M · Owns: `src/utils/supabase/functions/**`,
`src/utils/projects.ts`, `src/utils/users.ts`, `src/server/**`, `src/middleware.ts`,
`src/utils/supabase/middleware.ts`
- Move reads into `src/server/*` (server client, explicit columns, no emails); remove
  `"use server"` from modules taking user ids; `getCommits`/`getCommit` check access first.
- Middleware: `/api/*` → 401 JSON instead of redirect; public repo routes allowed for
  anon (actual protection is RLS + `getRepoAccess`); `safeRedirectPath` for `?next`;
  drop per-request `console.log`.

**T07 · Project creation** · M · Owns: `src/app/new-project/**`, `src/app/api/projects/**`
· after T05
- Fix always-fails validation (`NewProjectForm.tsx:152`), uniqueness check
  (`created_by`), redirect to `/${username}/${name}`.
- Replace Tiptap README field with a Markdown textarea + preview; README becomes a real
  `README.md` via `create_project` RPC. Remove fake Kanban templates; optional
  templates: Empty / Node / Python (seed files).

**T08 · Auth & user fixes** · M · Owns: `src/utils/auth.ts`, `src/app/login/**`,
`src/app/create-account/**`, `src/app/forgot-password/**`, `src/app/auth/**`
- Remove email-enumeration pre-checks and the impossible `admin.deleteUser`; fix inverted
  `identities` check; rely on the T05 trigger instead of `captureUserDetails`.

### Wave 2 — Product surface (P1)

**T09 · Repo page & header** · M · Owns: `src/app/[username]/[repo]/page.tsx`,
`Content.tsx`, `repoLayout.tsx`, `src/components/repo/RepoHeader.tsx`,
`src/components/repo/MarkdownView.tsx` (new)
- Render `README.md` below the file list (react-markdown + remark-gfm, no raw HTML).
- Header: real current user, correct "created by", member avatars → `/u/[name]`, tabs =
  Code / Commits / Settings (admin); correct active tab.

**T10 · Commit history & browse-at-commit** · M · Owns: `src/app/[username]/[repo]/commits/**`,
`commit/**`, `tree/**` (new), `src/components/repo/CommitHistory.tsx`,
`CommitDetails.tsx`, `FileChanges.tsx`, `src/components/date-range-picker.tsx`
- Pagination UI; committer & date filters as URL params applied server-side; committer
  links; "Browse files at this commit" route reusing `FileExplorer` read-only.

**T11 · Repo settings** · M · Owns: `src/app/[username]/[repo]/settings/**` (General,
Danger zone), `src/app/api/repo/[username]/[repo]/route.ts` · after T06
- Rename (redirect to new URL), description, visibility, close/reopen, delete (type name
  to confirm, owner only).

**T12 · Members & invitations** · L · Owns: `settings/members/**`,
`src/app/api/repo/[username]/[repo]/members/**`, `src/app/api/invites/**`,
`src/app/invites/**`, `src/emails/**`, delete `src/app/api/invite-user/**` · after T04
- Invite by username (in-app) or email (pending row with `invited_email`, bound to the
  user on sign-up/accept); role select; remove; accept/decline page redirects to repo.
- Email: Resend via env key, link built from `NEXT_PUBLIC_SITE_URL`, from-address env var.
- Replace task-board permission map in `useAccessStore` with read/write/admin/owner.

**T13 · Projects dashboard** · M · Owns: `src/app/projects/**`, `src/stores/**`,
`src/hooks/useProjectAccess.ts`
- Server client data; "Owned" / "Shared with me" tabs; links use owner name; null-safe
  search; actions call T11 APIs; delete only for owner; fix "Loading…" store dependency.

**T14 · Profile, username & avatars** · M · Owns: `src/app/profile/**`, `src/app/u/**`
(new), `src/components/ProfilePhotoUploader.tsx`, `src/app/api/profile/**`,
`supabase/migrations/0005_storage.sql`
- `avatars` bucket + policies (§2.4); uploader for every provider; username change via
  API with validation + uniqueness (warn that repo URLs change); fix links-editing bug
  and null-name crash; public profile at `/u/[username]` without email.

### Wave 3 — Collaboration quality (P1/P2)

**T15 · CRDT collaboration (Yjs)** · L · Owns: `src/hooks/useCollaboration.ts`,
`src/lib/yjs-supabase-provider.ts` (new), edit page component
- Yjs doc per file, `y-monaco` binding (dynamic import, client only), provider over
  Supabase broadcast with sync step 1/2 + update messages and awareness → presence.
- Done when: a scripted two-client test applying interleaved random edits converges.

**T16 · Conflict-safe saves** · M · Owns: commit route, `repo-client.ts`, edit page ·
after T05
- Editor sends `baseCommitId`; 409 on stale base → dialog: view upstream diff, reload, or
  save as new commit on top (re-apply buffer). Repo channel `commit-created` updates
  explorers and editors live.

**T17 · Multi-file editor layout** · M · Owns: `src/app/[username]/[repo]/edit/**`
(layout + sidebar only; coordinate with T15/T16 on `EditPage.tsx`) · after T15
- VS Code-style: file tree sidebar, tabs for open files, create/rename from sidebar,
  language picked from extension.

### Wave 4 — Ship (P2)

**T18 · E2E tests** · L · Owns: `e2e/**`, `playwright.config.ts`, CI job
- Sign up → create repo → add file → edit with two browsers → commit → history → invite.

**T19 · Landing, metadata & polish** · S · Owns: `src/app/Landing.tsx`, `src/app/layout.tsx`,
`src/components/Header.tsx`, `src/components/ThemeToggle.tsx`, `public/**`
- Real screenshots (both themes), honest feature list, metadata, `resolvedTheme` toggle,
  no blank flash while loading, 404/error pages.

**T20 · Docs & release** · S · Owns: `README.md`, `docs/**`
- Setup (migrations order, buckets, OAuth), architecture, contributing; tag v1.0.

### Stretch (after v1.0)

- **T21 · Code runner** — decide: integrate "Run" into the editor via a rate-limited
  server proxy (`/api/repo/.../run`), or delete the unlinked `/file/[id]` playground.
- **T22 · Binary files** — `repo-files` bucket, upload/download images in the explorer,
  `file_tree.storage_path`.
- **T23 · Performance** — paginate file tree for big repos, cache `files_at_commit`.

---

## 5. Audit reference (Oct 14, 2026)

Known defects that tasks above fix, with locations, so agents don't re-discover them:

- New project never created: `NewProjectForm.tsx:152-156` (validation object always
  truthy), uniqueness query uses non-existent `user_id` (`:83`), redirect to missing
  `/projects/[id]` (`:194`); `createProject` trusts client `userId`, inserts owner
  membership without role, throws wrong variable (`functions/projects.ts:8-46`).
- Hardcoded Resend key: `src/utils/emails/index.ts:3`.
- `/api/invite-user` is an open email relay with attacker-controlled link host.
- No RLS policies anywhere; `projects.is_public` missing from `definitions.sql`.
- Server components using the browser client: `projects/page.tsx`, `profile/page.tsx`,
  `profile/[profileId]/page.tsx`. Other users' emails sent to the client
  (`users.ts:28`, `functions/projects.ts:284`).
- Username editable without validation/uniqueness (`ProfileForm.tsx:150`,
  `AccountDetails.tsx:99`); `AccountDetails.tsx:77` overwrites all links.
- Repo header: everyone sees "Created by you" (`repoLayout.tsx:39`); Security/Settings
  tabs 404; README never rendered; commit filters decorative; no pagination UI.
- Project links use viewer's name instead of owner's (`ProjectItem.tsx:37`).
- Middleware blocks anonymous viewing of public repos; `/api/*` redirects instead of 401.
- Landing light-mode screenshot path broken (`Landing.tsx:133-136`); unimplemented
  feature claims.
- Dead files: custom-field/label UI, `StackedAvaters`, `UserCard`, `UserProvider`,
  `repo/CodeViewer`, `repo/ReadmeViewer`, `app/components/{Header,UserAvatar,MarkdownViewer}`,
  `ui/{chart,drawer,sheet,checkbox,tree-view}`, `hooks/{useCopyToClipboard,useDebounce,useModalDialog}`,
  `lib/helpers.ts`, `utils/{activities,array-utils,date}.ts`, `utils/supabase/functions/index.ts`,
  `utils/emails/index.ts`, `constants/{default-options,colors,file-viewer-themes}.ts`,
  `types/{database,diff,api-response}.ts`, `new-project/ProjectTemplate*.tsx`, `mock-data.ts`.
  (`components/TextEditor/**` is live until T07 replaces it.)
- No tests, no CI.
