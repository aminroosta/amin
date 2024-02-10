CREATE TYPE public.amin_job_state AS ENUM (
    'available',
    'scheduled',
    'executing',
    'retryable',
    'completed',
    'discarded',
    'cancelled'
);

CREATE TABLE public.amin_jobs (
    id bigint NOT NULL,
    state public.amin_job_state DEFAULT 'available'::public.amin_job_state NOT NULL,
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
    CONSTRAINT attempt_range CHECK (((attempt >= 0) AND (attempt <= max_attempts))),
    CONSTRAINT positive_max_attempts CHECK ((max_attempts > 0)),
    CONSTRAINT queue_length CHECK (((char_length(queue) > 0) AND (char_length(queue) < 128))),
    CONSTRAINT worker_length CHECK (((char_length(worker) > 0) AND (char_length(worker) < 128)))
);

COMMENT ON TABLE public.amin_jobs IS '12';
ALTER TABLE public.amin_jobs ADD CONSTRAINT non_negative_priority CHECK ((priority >= 0)) NOT VALID;
ALTER TABLE ONLY public.amin_jobs ADD CONSTRAINT amin_jobs_pkey PRIMARY KEY (id);


CREATE SEQUENCE public.amin_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.amin_jobs_id_seq OWNED BY public.amin_jobs.id;
SELECT pg_catalog.setval('public.amin_jobs_id_seq', 1, false);
ALTER TABLE ONLY public.amin_jobs ALTER COLUMN id SET DEFAULT nextval('public.amin_jobs_id_seq'::regclass);

CREATE UNLOGGED TABLE public.amin_peers (
    name text NOT NULL,
    node text NOT NULL,
    started_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL
);
ALTER TABLE ONLY public.amin_peers ADD CONSTRAINT amin_peers_pkey PRIMARY KEY (name);

CREATE INDEX amin_jobs_args_index ON public.amin_jobs USING gin (args);
CREATE INDEX amin_jobs_meta_index ON public.amin_jobs USING gin (meta);
CREATE INDEX amin_jobs_state_queue_priority_scheduled_at_id_index ON public.amin_jobs USING btree (state, queue, priority, scheduled_at, id);

