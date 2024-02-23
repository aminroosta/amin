import { job_list } from './job';
import { WorkerPool } from './worker-pool';

export async function start({
  queues,
  driver,
}: {
  queues: string[],
  driver: any
}) {
  const pool = new WorkerPool();

  pool.addWorker();

  job_list.map(j => console.log(j.name, j.filename, j.queue));
}
