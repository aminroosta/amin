import { EmailUserJob } from "./email_user_job";

await EmailUserJob.enqueue({ a: 1 });
