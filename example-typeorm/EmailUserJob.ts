import type { EntityManager } from "typeorm";
import { EramJob } from "eramjs";

export class EmailUserJob extends EramJob {
  static {
    EmailUserJob.register({
      queue: 'emails'
    });
  }

  async perform(driver: EntityManager, args: object) {
    console.log(args);
  }
}

