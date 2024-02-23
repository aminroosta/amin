import { fork, ChildProcess } from 'child_process';
import path from 'path';


export class WorkerPool {
  workers: { worker: ChildProcess, controller: AbortController }[] = [];

  addWorker() {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const { signal } = controller;
      const worker = fork(
        path.join(import.meta.dirname, './worker.ts'),
        { signal }
      );

      if (!worker.pid) {
        throw new Error("Error: failed to create child process workers.");
      }
      this.workers.push({ worker, controller });

      worker.on('error', error => {
        // FIXME: what do we do when the worker errors out?
        console.log({ error });
      });

      worker.on('exit', () => {
        console.log(`worker.pid=${worker.pid} exited`);
        this.workers = this.workers.filter(w => w.worker !== worker);
      });
      worker.on('spawn', () => {

      });
    });
  }
}
