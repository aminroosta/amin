import { EmailUserJob } from "./email_user_job";
import { start } from '..';

await start({
  queues: ['emails'],
  driver: null
});

await EmailUserJob.enqueue({ a: 1 });
