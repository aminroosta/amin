import { EramJob } from "..";

export class EmailUserJob extends EramJob {
  static {
    EmailUserJob.register({
      filename: import.meta.filename,
      queue: 'emails'
    });
  }

  async perform(_driver: any, args: object) {
    console.log(args);
  }
}

