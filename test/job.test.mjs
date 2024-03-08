import { describe, it } from 'node:test';
import { EramJob } from '../lib/job.mjs';
import { deepEqual, throws } from 'node:assert';


describe('EramJob', () => {
  it('Registers a job', () => {
    class ExampleJob extends EramJob {
      static {
        ExampleJob.register();
      }

      async perform() { }
    }

    const expected = [{
      name: 'ExampleJob',
      filename: '',
      queue: 'default',
      max_attempts: 20,
      priority: 0,
      unique: null
    }];
    deepEqual(EramJob._job_definitions, expected);
  });

  it('throws if the job does not have a .perform method', () => {
    throws(() => {
      class ExampleJob extends EramJob {
        static {
          ExampleJob.register();
        }
      }
    }, {
      name: 'MissingPerformMethodError',
      message: 'Class ExampleJob must define an async perform() method.'
    });
  });
});

