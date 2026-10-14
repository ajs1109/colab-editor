#!/usr/bin/env bash
# Runs the database tests against a throwaway local PostgreSQL cluster.
#
#   1. initdb + start a private server (unix socket in a temp dir, no TCP);
#   2. load supabase/tests/auth_stub.sql (roles, auth schema, test helpers);
#   3. apply supabase/migrations/*.sql in filename order;
#   4. run every supabase/tests/*.test.sql.
#
# Every file runs with ON_ERROR_STOP, so a failed statement or a RAISE EXCEPTION
# fails that file. Exits non-zero if anything fails. The cluster and temp dir are
# removed on exit.
#
# Env: PG_BIN   directory with initdb/pg_ctl/psql (default: auto-detect)
#      PGTEST_PORT  port number used for the socket name (default 54329)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PGTEST_PORT:-54329}"

# --- Locate PostgreSQL binaries ----------------------------------------------
find_pg_bin() {
  if [[ -n "${PG_BIN:-}" ]]; then
    echo "$PG_BIN"
    return
  fi
  if command -v pg_config >/dev/null 2>&1; then
    local dir
    dir="$(pg_config --bindir)"
    if [[ -x "$dir/initdb" ]]; then
      echo "$dir"
      return
    fi
  fi
  # Highest major version (numeric sort, so 16 beats 9).
  local newest
  newest="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -n1 || true)"
  if [[ -n "$newest" && -x "$newest/initdb" ]]; then
    echo "$newest"
    return
  fi
  if command -v initdb >/dev/null 2>&1; then
    dirname "$(command -v initdb)"
    return
  fi
  echo "db-test: could not find PostgreSQL binaries (initdb). Set PG_BIN." >&2
  exit 1
}
PG_BIN="$(find_pg_bin)"
for tool in initdb pg_ctl psql; do
  [[ -x "$PG_BIN/$tool" ]] || { echo "db-test: $PG_BIN/$tool not found" >&2; exit 1; }
done

# --- Unprivileged user when running as root -----------------------------------
# PostgreSQL refuses to run as root, so run everything as another user.
RUN_AS=""
if [[ "$(id -u)" -eq 0 ]]; then
  if id postgres >/dev/null 2>&1; then
    RUN_AS="postgres"
  else
    id pgtest >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin pgtest
    RUN_AS="pgtest"
  fi
fi

as_pg() {
  if [[ -n "$RUN_AS" ]]; then
    if command -v runuser >/dev/null 2>&1; then
      runuser -u "$RUN_AS" -- "$@"
    else
      setpriv --reuid="$RUN_AS" --regid="$(id -g "$RUN_AS")" --init-groups -- "$@"
    fi
  else
    "$@"
  fi
}

# --- Temp dir, cleanup ---------------------------------------------------------
# As root, keep the dir under /tmp so the unprivileged user can reach it.
if [[ -n "$RUN_AS" ]]; then
  WORK="$(mktemp -d /tmp/colab-dbtest.XXXXXX)"
else
  WORK="$(mktemp -d "${TMPDIR:-/tmp}/colab-dbtest.XXXXXX")"
fi
DATA="$WORK/data"
LOG="$WORK/server.log"
STARTED=0

cleanup() {
  local status=$?
  if [[ "$STARTED" -eq 1 ]]; then
    as_pg "$PG_BIN/pg_ctl" -D "$DATA" -m immediate -w stop >/dev/null 2>&1 || true
  fi
  rm -rf "$WORK"
  exit "$status"
}
trap cleanup EXIT INT TERM

# Copy the SQL into the temp dir so the unprivileged user can read it even if the
# checkout itself is not world-readable.
mkdir -p "$WORK/sql/migrations" "$WORK/sql/tests"
cp "$REPO_ROOT"/supabase/migrations/*.sql "$WORK/sql/migrations/"
cp "$REPO_ROOT"/supabase/tests/*.sql "$WORK/sql/tests/"
if [[ -n "$RUN_AS" ]]; then
  chown -R "$RUN_AS" "$WORK"
fi
cd "$WORK"

# --- Start the server ----------------------------------------------------------
echo "db-test: PostgreSQL from $PG_BIN ($("$PG_BIN/postgres" --version 2>/dev/null || echo unknown))"
as_pg "$PG_BIN/initdb" -D "$DATA" --auth=trust --encoding=UTF8 --locale=C --no-sync -U postgres >"$WORK/initdb.log" 2>&1 || {
  cat "$WORK/initdb.log" >&2
  exit 1
}
if ! as_pg "$PG_BIN/pg_ctl" -D "$DATA" -l "$LOG" -w -t 30 start \
  -o "-k $WORK -p $PORT -c listen_addresses='' -c fsync=off -c synchronous_commit=off -c full_page_writes=off" >/dev/null; then
  echo "db-test: server failed to start" >&2
  cat "$LOG" >&2 || true
  exit 1
fi
STARTED=1

run_sql() {
  as_pg "$PG_BIN/psql" -X -q -v ON_ERROR_STOP=1 -h "$WORK" -p "$PORT" -U postgres -d postgres "$@"
}

FAILED=0
# run_file <label> <file> [psql args...]: prints PASS/FAIL, output shown on failure.
run_file() {
  local label="$1" file="$2"
  shift 2
  local out
  if out="$(run_sql "$@" -f "$file" 2>&1)"; then
    echo "PASS  $label"
    return 0
  fi
  echo "FAIL  $label"
  echo "$out" | sed 's/^/      /'
  FAILED=$((FAILED + 1))
  return 1
}

# --- Setup: auth stub + migrations (abort on first failure) -------------------
echo "-- setup"
run_file "supabase/tests/auth_stub.sql" "$WORK/sql/tests/auth_stub.sql" || exit 1
for f in "$WORK"/sql/migrations/*.sql; do
  run_file "supabase/migrations/$(basename "$f")" "$f" --single-transaction || exit 1
done

# --- Tests ---------------------------------------------------------------------
echo "-- tests"
shopt -s nullglob
tests=("$WORK"/sql/tests/*.test.sql)
if [[ ${#tests[@]} -eq 0 ]]; then
  echo "db-test: no supabase/tests/*.test.sql files found" >&2
  exit 1
fi
for f in "${tests[@]}"; do
  run_file "supabase/tests/$(basename "$f")" "$f" || true
done

echo
if [[ "$FAILED" -gt 0 ]]; then
  echo "db-test: $FAILED of ${#tests[@]} test file(s) failed"
  exit 1
fi
echo "db-test: all ${#tests[@]} test file(s) passed"
