export const jobs: Record<string, {
  name: string,
  queue: string,
  filename: string
}> = {};
export class EramJob {
  static async enqueue(args: object) {
    // TODO:
    // console.log(args);
    // console.log(this.name);
  }
  static register(opts: { filename: string, queue: string }) {
    jobs[this.name] = {
      name: this.name,
      filename: opts.filename,
      queue: opts.queue
    }
    console.log(`registered ${this.name} on ${opts.queue} to ${opts.filename}`);
  }
}
