Lets walk through an example of how a typeorm setup would look like.


const config = { ... }
const datasource = new DataSource(config);

await datasource.initialize();
await EramEngine.start({
  queues: {
    default: { limit: 10 },
  },
  driver: {
     type: 'typeorm',
     config: config,
  },
  prune: {
    interval: 30_000,
    limit: 10_000,
    max_age: 60
  },
  lifeline: {
    interval: 60_000,
    rescue_after: 3_600_000,
  },
  reindexer: {
    schedule: '@midnight',
    indexes: [ 'eram_jobs_args_index', 'eram_jobs_meta_index' ],
    timeout: 15,
    timezone: 'Etc/UTC'
  },
  cron: [
    ['* * * * * ', MinuteWorker],
    ['0 * * * * ', HourlyWorker, { custom: 'arg' }]
  ]
});

EmailUserJob.register({
  filename: import.meta.filename,
  queue: 'default',
  max_attempts: 20,
  priority: 0,
  tags: [],
  unique: {
    period: 30
  }
});

EmailUserJob.equeue({
  args: { email: 'test@example.com' },
  priority: 1
});


threading
----
- Jobs without a filename will be executed on the main thread.
- The library uses `driver.config` to instantiate the corresponding database
  driver, config must be json serializable so it can be passed to worker
  threads.
- Each queue will have it's own worker thread, which calls
  `require(filename).WorkerName` to get and execute the job.
- Plugins (cron, reindexer, lifeline and prune) run in a separate worker thread.

writing custom drivers
---
Custom drivers in EramJS need to be defined in a separate files.
That allows worker threads to import and use a custom driver.

await EramEngine.start({
  driver: {
    type: 'custom',
    filename: path.join(__dirname, './custom_driver.js'),
    config: { ... }
  }
});

A driver, returns 3 basic properties:
- `postgresql_url` will be used by the library to connect to the postgresql using
  postgres.js, to listen and notify and to run the plugins.
- `runInTransaction` is responsible for running the job in a transaction and
  passing the entity_manger/driver to the callback function; it returns a promise.
- `enqueue` is responsible for inserting a new job, it could be called inside or
  outside a transaction

// custom_driver.js
export const driver(config) {
   return {
     runInTransaction = fn => fn(driver),
     enqueue = (driver | null, args) => {
       driver.query('select eram_enqueue_job($1);', args);
     },
     postgresql_url = string
   }
}


