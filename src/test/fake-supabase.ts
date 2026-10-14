// In-memory stand-in for the supabase-js query builder, for unit tests.
//
// Supports only what our server code uses: from(table) with select / insert / delete,
// eq / in filters, order, range, single / maybeSingle, and awaiting the builder.
// It is intentionally loose (rows are plain objects); the code under test is what
// gets type-checked.
//
//   const { client, db } = createFakeSupabase({ unique: { file_tree: ['path', 'commit_id'] } });
//   db.commits.push({ id: 'c0', project_id: 'p', committed_at: '...' });
//   await createCommit(client, { ... });

import type { SupabaseClient } from '@supabase/supabase-js';

export type Row = Record<string, any>;
export type FakeDb = Record<string, Row[]>;

export interface FakeSupabaseOptions {
  /** Initial rows per table. Tables are created on first use if missing. */
  tables?: FakeDb;
  /** Unique constraints per table: inserting a row that collides returns an error. */
  unique?: Record<string, string[]>;
}

type Result = { data: any; error: { message: string } | null };

export function createFakeSupabase(options: FakeSupabaseOptions = {}) {
  const db: FakeDb = { ...(options.tables ?? {}) };
  const unique = options.unique ?? {};
  // Monotonic counters so generated ids and created_at values are deterministic
  // and strictly increasing in insertion order.
  let idCounter = 0;
  let createdAt = Date.UTC(2023, 0, 1);

  const table = (name: string) => (db[name] ??= []);

  function from(name: string) {
    const filters: ((r: Row) => boolean)[] = [];
    let order: [string, boolean] | null = null;
    let range: [number, number] | null = null;
    let op: 'select' | 'insert' | 'delete' = 'select';
    let inserted: Row[] = [];
    let error: Result['error'] = null;

    const run = (): Row[] => {
      if (error) return [];
      if (op === 'insert') return inserted;
      let out = table(name).filter((r) => filters.every((f) => f(r)));
      if (op === 'delete') {
        db[name] = table(name).filter((r) => !out.includes(r));
        return [];
      }
      if (order) {
        const [col, asc] = order;
        out = [...out].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (asc ? 1 : -1));
      }
      if (range) out = out.slice(range[0], range[1] + 1);
      return out;
    };
    const result = (pick: (rows: Row[]) => any): Result => {
      const rows = run();
      return error ? { data: null, error } : { data: pick(rows), error: null };
    };

    const builder: any = {
      select: () => builder,
      eq(col: string, value: any) {
        filters.push((r) => r[col] === value);
        return builder;
      },
      in(col: string, values: any[]) {
        filters.push((r) => values.includes(r[col]));
        return builder;
      },
      order(col: string, opts: { ascending?: boolean } = {}) {
        order = [col, opts.ascending ?? true];
        return builder;
      },
      range(a: number, b: number) {
        range = [a, b];
        return builder;
      },
      insert(value: Row | Row[]) {
        op = 'insert';
        const rows = (Array.isArray(value) ? value : [value]).map((r) => ({
          id: `${name}-${++idCounter}`,
          created_at: new Date(createdAt++).toISOString(),
          ...r,
        }));
        const keys = unique[name];
        if (keys) {
          const key = (r: Row) => JSON.stringify(keys.map((k) => r[k]));
          const seen = new Set(table(name).map(key));
          for (const r of rows) {
            if (seen.has(key(r))) {
              error = { message: `duplicate key value violates unique constraint on ${name} (${keys.join(', ')})` };
              return builder;
            }
            seen.add(key(r));
          }
        }
        inserted = rows;
        table(name).push(...rows);
        return builder;
      },
      delete() {
        op = 'delete';
        return builder;
      },
      single: () => Promise.resolve(result((rows) => rows[0])),
      maybeSingle: () => Promise.resolve(result((rows) => rows[0] ?? null)),
      then: (onFulfilled: (r: Result) => any, onRejected?: (e: unknown) => any) =>
        Promise.resolve(result((rows) => rows)).then(onFulfilled, onRejected),
    };
    return builder;
  }

  const client = { from } as unknown as SupabaseClient;
  return { client, db };
}
