import type { EntityManager } from "typeorm";
import { EramJob } from "eram";

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

