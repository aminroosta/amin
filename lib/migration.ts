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
        await this.sql.begin(async sql => {
            await sql`
CREATE TYPE public.eram_job_state AS ENUM (
  'available',
  'scheduled',
  'executing',
  'retryable',
  'completed',
  'discarded',
  'cancelled'
);`;
            await sql`
CREATE TABLE public.eram_jobs (
  id bigserial PRIMARY KEY,
  state public.eram_job_state DEFAULT 'available'::public.eram_job_state NOT NULL,
  queue text DEFAULT 'default'::text NOT NULL,
  worker text NOT NULL,
  args jsonb DEFAULT '{}'::jsonb NOT NULL,
  errors jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL,
  attempt integer DEFAULT 0 NOT NULL,
  max_attempts integer DEFAULT 20 NOT NULL,
  inserted_at timestamp without time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
  scheduled_at timestamp without time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
  attempted_at timestamp without time zone,
  completed_at timestamp without time zone,
  attempted_by text[],
  discarded_at timestamp without time zone,
  priority integer DEFAULT 0 NOT NULL,
  tags character varying(255)[] DEFAULT ARRAY[]::character varying[],
  meta jsonb DEFAULT '{}'::jsonb,
  cancelled_at timestamp without time zone,

  CONSTRAINT attempt_range CHECK (attempt BETWEEN 0 AND max_attempts),
  CONSTRAINT positive_max_attempts CHECK (max_attempts > 0),
  CONSTRAINT queue_length CHECK (char_length(queue) BETWEEN 1 AND 127),
  CONSTRAINT worker_length CHECK (char_length(worker) BETWEEN 1 AND 127),
  CONSTRAINT non_negative_priority CHECK (priority >= 0)
);`;
            await sql`COMMENT ON TABLE public.eram_jobs IS '1';`;
            await sql`
CREATE UNLOGGED TABLE public.eram_peers (
  name text PRIMARY KEY,
  node text NOT NULL,
  started_at timestamp without time zone NOT NULL,
  expires_at timestamp without time zone NOT NULL
);`;

            await sql`
CREATE INDEX eram_jobs_args_index ON public.eram_jobs USING gin (args);`;
            await sql`
CREATE INDEX eram_jobs_meta_index ON public.eram_jobs USING gin (meta);`;
            await sql`
CREATE INDEX eram_jobs_state_queue_priority_scheduled_at_id_index
  ON public.eram_jobs
  USING btree (state, queue, priority, scheduled_at, id);`;
        });
    }

    async current_version() {
        const prefix = 'public';
        const rows: Row[] = await this.sql`
SELECT description
FROM pg_class
LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_class.relname = 'eram_jobs'
AND pg_namespace.nspname = ${prefix}`;

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
        await this.sql.begin(async sql => {
            await sql`drop table if exists public.eram_jobs;`;
            await sql`drop table if exists public.eram_peers;`;
            await sql`drop type if exists public.eram_job_state;`;
        });
    }
}

// TODO: SqliteMigration

