export const job_list: {
  name: string,
  queue: string,
}[] = []

export class EramJob {
  static async enqueue(args: object) {
    // TODO:
  }
  static register({ queue = 'default' }: { queue?: string } = {}) {
    job_list.push({
      name: this.name,
      queue
    });
    console.log(`registered ${this.name} on ${queue}`);
  }
}
