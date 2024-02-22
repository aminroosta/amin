import { fork, ChildProcess } from 'child_process';
import path from 'path';


export class WorkerPool {
  workers: ChildProcess[] = [];

  addWorker() {
    const worker = fork(
      path.join(import.meta.dirname, './worker.ts'), {}
    );

    if (!worker.pid) {
      throw new Error("Error: failed to create child process workers.");
    }
    this.workers.push(worker);
    worker.on('exit', () => {
      console.log(`worker.pid=${worker.pid} exited`);
      this.workers = this.workers.filter(w => w === worker);
    });
  }
}
