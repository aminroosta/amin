class EramJob {
  static async enqueue(_args: object) {
    console.log(this.name);
  }
  static register(opts: any) {
    console.log(this.name, opts);
  }
}
class EmailUserJob extends EramJob {
  static {
    EmailUserJob.register({ queue: 'emails' });
  }

  async perform(driver: any, args: object) {
    console.log(args);
  }
}


await EmailUserJob.enqueue({ a: 1 });
