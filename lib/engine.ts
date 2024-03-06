import { job_list } from './job';
import { WorkerPool } from './worker-pool';
// import type { Pool } from 'pg';

type Config = {
  queues: Record<string, { limit: number }>,
  runInTransaction: (
    fn: (driver: any) => Promise<unknown>
  ) => Promise<unknown>,
  connection?: {
    port?: number,
    username?: string,
    password?: string,
    database?: string,
  }
};

export class EramEgine {
  static async start({ queues }: Config) {
    // const pool = new WorkerPool();
    // pool.addWorker();
  }
}
