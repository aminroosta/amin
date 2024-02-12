import postgres, { type Row, type Sql } from 'postgres';

// const sql = postgres({ /* options */ })

export interface IMigration {
    up(opts: { version: number }): void;
    down(opts: { version: number }): void;
}


export class PgMigration implements IMigration {
    constructor(public sql: Sql) { }

    async up({ version }: { version: number }) {
        let current_version = await this.current_version();

        if (current_version == 0 && version >= 1) {
            await this.up_v1();
            current_version = 1;
        }
    }

    async up_v1() {
        await this.sql.begin(sql => sql.unsafe(`
CREATE SCHEMA eram;
CREATE TYPE eram.eram_job_state AS ENUM (
  'available',
  'scheduled',
  'executing',
  'retryable',
  'completed',
  'discarded',
  'cancelled'
);
CREATE TABLE eram.eram_jobs (
  id bigserial PRIMARY KEY,
  state eram.eram_job_state DEFAULT 'available'::eram.eram_job_state NOT NULL,
  queue text DEFAULT 'default'::text NOT NULL,
  worker text NOT NULL,
  args jsonb DEFAULT '{}'::jsonb NOT NULL,
  errors jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL,
  attempt integer DEFAULT 0 NOT NULL,
  max_attempts integer DEFAULT 20 NOT NULL,
  inserted_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL,
  scheduled_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL,
  attempted_at timestamp,
  completed_at timestamp,
  attempted_by text[],
  discarded_at timestamp,
  priority integer DEFAULT 0 NOT NULL,
  tags character varying(255)[] DEFAULT ARRAY[]::character varying[],
  meta jsonb DEFAULT '{}'::jsonb,
  cancelled_at timestamp,

  CONSTRAINT attempt_range CHECK (attempt BETWEEN 0 AND max_attempts),
  CONSTRAINT positive_max_attempts CHECK (max_attempts > 0),
  CONSTRAINT queue_length CHECK (char_length(queue) BETWEEN 1 AND 127),
  CONSTRAINT worker_length CHECK (char_length(worker) BETWEEN 1 AND 127),
  CONSTRAINT non_negative_priority CHECK (priority >= 0)
);
COMMENT ON TABLE eram.eram_jobs IS '1';
CREATE UNLOGGED TABLE eram.eram_peers (
  name text PRIMARY KEY,
  node text NOT NULL,
  started_at timestamp NOT NULL,
  expires_at timestamp NOT NULL
);

CREATE INDEX eram_jobs_args_index ON eram.eram_jobs USING gin (args);
CREATE INDEX eram_jobs_meta_index ON eram.eram_jobs USING gin (meta);
CREATE INDEX eram_jobs_state_queue_priority_scheduled_at_id_index
  ON eram.eram_jobs
  USING btree (state, queue, priority, scheduled_at, id);

CREATE TABLE eram.eram_queues (
  name text PRIMARY KEY,
  opts jsonb DEFAULT '{}'::jsonb NOT NULL,
  "only" jsonb DEFAULT '{}'::jsonb NOT NULL,
  lock_version integer DEFAULT 1,
  inserted_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL
);

CREATE UNLOGGED TABLE eram.eram_producers (
  uuid uuid PRIMARY KEY,
  name text NOT NULL,
  node text NOT NULL,
  queue text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb NOT NULL,
  inserted_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL
);

CREATE TABLE eram.eram_crons (
  name text PRIMARY KEY,
  expression text NOT NULL,
  worker text NOT NULL,
  opts jsonb DEFAULT '{}'::jsonb NOT NULL,
  paused boolean DEFAULT false NOT NULL,
  lock_version integer DEFAULT 1,
  inserted_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL,
  updated_at timestamp DEFAULT timezone('UTC'::text, now()) NOT NULL
);
      `));
    }

    async current_version() {
        const rows: Row[] = await this.sql`
SELECT description
FROM pg_class
LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_class.relname = 'eram_jobs'
AND pg_namespace.nspname = 'eram'`;

        if (rows.length) {
            const { description } = rows[0];
            return parseInt(description);
        }
        return 0;
    }

    async down({ version }: { version: number }) {
        let current_version = await this.current_version();
        if (current_version == 1 && version == 1) {
            await this.down_v1();
            current_version = 0;
        }
    }

    async down_v1() {
        await this.sql.begin(sql => sql.unsafe(`
drop table if exists eram.eram_crons;
drop table if exists eram.eram_producers;
drop table if exists eram.eram_queues;
drop table if exists eram.eram_jobs;
drop table if exists eram.eram_peers;
drop type if exists eram.eram_job_state;
drop schema eram;
`
        ));
    }
}

// TODO: SqliteMigration

