
export class EramJob {
  static async enqueue(args: object) {
    console.log(args);
    console.log(this.name);
  }
  static register(opts: { filename: string, queue: string }) {
    console.log(this.name, opts);
  }
}
