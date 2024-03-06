The main advantages of Ecto are:
(1) the UI
(2) transactional consistency
(3) being ergonomic


Unlike Ecto, there is no de-facto ORM for JavaScript.
(1) https://github.com/brianc/node-postgres i.e, pg
(2) https://github.com/typeorm/typeorm uses pg
(3) https://github.com/porsager/postgres
(4) https://github.com/prisma/prisma could use pg https://github.com/prisma/prisma/tree/main/packages/adapter-pg / https://github.com/prisma/prisma/tree/main/packages/driver-adapter-utils
(5) https://github.com/knex/knex uses pg
(6) https://github.com/sequelize/sequelize uses pg
(7) https://github.com/bookshelf/bookshelf uses knex
(8) https://github.com/Vincit/objection.js uses knex
(9) https://github.com/drizzle-team/drizzle-orm uses pg or postgres.js

pg example:
-----
client = await pool.connect()
await client.query('SELECT $1::text as message', ['Hello world!'])
client.query('LISTEN foo');
client.on('notification', (msg: any) => { });

try {
  await client.query('BEGIN')
  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
}


driver-adapter design:
-----
export interface ResultSet {
  columnNames: Array<string>
  rows: Array<Array<unknown>>
}

export type Query = {
  sql: string
  args: Array<unknown>
}

export type Error =
  | {
      kind: 'GenericJs'
      id: number
    }
  | {
      kind: 'Postgres'
      code: string
      severity: string
      message: string
      detail: string | undefined
      column: string | undefined
      hint: string | undefined
    }

export interface Queryable {
  queryRaw(params: Query): Promise<Result<ResultSet>>
  executeRaw(params: Query): Promise<Result<number>>

  listen(channel: string, callback: Function): Promise<Result<void>>
}

export interface DriverAdapter extends Queryable {
  startTransaction(): Promise<Result<Transaction>>
}

export interface Transaction extends Queryable {
  commit(): Promise<Result<void>>
  rollback(): Promise<Result<void>>
}


defining jobs
-----
class EramJob {
  static register(opts: object) { ... }
  static async enqueue(args: object) {
    const name = this.name;
  }
}
class EmailUserJob extends EramJob {
  static {
    EmailUserJob.register({ queue: 'emails' });
  }

  async perform(args, opts) {
    console.log(args);
  }
}
await EmailUserJob.enqueue({email: 'a@b.c'});

engine
-----
- https://www.postgresql.org/docs/current/explicit-locking.html use pg_try_advisory_xact_lock
- https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS


stage_jobs() {
  WITH subquery AS (
    SELECT id, state
    FROM jobs
    WHERE state IN ('scheduled', 'retryable')
      AND queue IS NOT NULL
      AND scheduled_at <= NOW()
    LIMIT limit
  )
  UPDATE jobs
  SET state = 'available'
  FROM subquery
  WHERE jobs.id = subquery.id
  RETURNING jobs.id, jobs.queue, subquery.state;
}

prune_jobs() {
  WITH subquery AS (
    SELECT id, queue, state
    FROM jobs
    WHERE state IN ('completed', 'cancelled', 'discarded')
      AND queue IS NOT NULL
      AND scheduled_at < NOW() - max_age
    LIMIT limit
  )
  DELETE FROM jobs
  USING subquery
  WHERE jobs.id = subquery.id
  RETURNING subquery.id, subquery.queue, subquery.state
}

complete_job() {
  UPDATE jobs
  SET state = 'completed', completed_at = NOW()
  WHERE id = job_id
  RETURNING *
}

discard_job() {
  UPDATE jobs
  SET state = 'discarded', discarded_at = NOW(), errors = array_append(errors, $1)
  WHERE id = $2;
}

error_job() {
  UPDATE jobs
  SET state = 'retryable',
      scheduled_at = NOW() + INTERVAL '$1 seconds',
      errors = array_append(errors, $2)
  WHERE id = $3;
}

snooze_job() {
  UPDATE jobs
  SET state = 'scheduled',
      scheduled_at = NOW() + INTERVAL '$1 seconds',
      max_attempts = max_attempts + 1
  WHERE id = $2;
}

cancel_job() {
  > with unsaved_error
  UPDATE jobs
  SET state = 'cancelled',
      cancelled_at = NOW(),
      errors = array_append(errors, $1)
  WHERE id = $2

  > without unsaved_error
  UPDATE jobs
  SET state = 'cancelled',
      cancelled_at = NOW()
  WHERE id = $1
    AND state NOT IN ('cancelled', 'completed', 'discarded')
}

cancel_all_jobs() {
  UPDATE jobs
  SET state = 'cancelled',
      cancelled_at = NOW()
  WHERE
    state NOT IN ('cancelled', 'completed', 'discarded') AND
    worker = $1 AND
    queue = $2
  RETURNING id, queue, state
}

retry_all_jobs() {
  UPDATE jobs
  SET state = 'available',
      max_attempts = GREATEST(max_attempts, attempt + 1),
      scheduled_at = NOW(),
      completed_at = NULL,
      cancelled_at = NULL,
      discarded_at = NULL
  WHERE
    state NOT IN ('available', 'executing') AND
    id = $1 AND
    worker = $2
  RETURNING id, queue, state
}

fetch_jobs() {
  WITH subset AS (
    SELECT id
    FROM jobs
    WHERE state = 'available' AND queue = $1
    ORDER BY priority ASC, scheduled_at ASC, id ASC
    LIMIT $2
    FOR UPDATE SKIP LOCKED
  )
  UPDATE jobs AS j
  SET state = 'executing',
      attempted_at = $3,
      attempted_by = $4,
      attempt = attempt + 1
  FROM subset s
  WHERE j.id = s.id AND j.attempt < j.max_attempts
  RETURNING count(*), array_agg(j.*);
}


stager
-----
calls Enine.stage_jobs and Notifier.notify(:insert, <queue_name>)

notifier
-----
listen, unlisten and notify

peer
------
maintains leadership for a particular instance within a cluster.
Notifier.listen(name, :leader)
Notifier.notify(:leader, %{down: name})

upsert_peer() {
  INSERT INTO oban_peers (name, node, started_at, expires_at)
  VALUES ('instance_name', 'peer_node', now, now + interval '30 seconds')
  ON CONFLICT (name)
  DO UPDATE SET expires_at = now + interval '30 seconds'
  RETURNING 1;
}


executer
-----
  |> record_started()
  |> resolve_worker()
  |> start_timeout()
  |> perform()
  |> normalize_state()
  |> record_finished()
  |> cancel_timeout()


process management
-----
- bull https://github.com/OptimalBits/bull/tree/develop/lib/process example
