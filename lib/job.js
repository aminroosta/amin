/**
  * Base class to be extended.
  * The register method is called in a static initializer block.
  * Pass the filename as a config parameter to run the job in its own thread.
  *
  * @example
  * export class EmailUserJob extends EramJob {
  *   static {
  *     EmailUserJob.register({
  *       queue: 'emails'
  *       filename: __filename,
  *     });
  *   }
  *
  *   async perform(driver, args) {
  *     console.log(args);
  *   }
  * }
  */
class EramJob {
  /**
   * Method to enqueue a job with the given arguments
   * @param {object} args - Arguments to be passed to the job.perform method
   */
  static async enqueue(_args) {
    // TODO:
  }

  /**
   * Static method to register a job with the given configuration
   * @param [JobConfig] config - Configuration object for the job (default empty object)
   */
  static register(config = {}) {
    const defaults = {
      name: this.name,
      filename: '',
      queue: 'default',
      max_attempts: 20,
      priority: 0,
      unique: null,
    };
    config = Object.assign({}, defaults, config);
    if (!this.prototype.perform || typeof this.prototype.perform !== 'function') {
      throw new EramError(
        `Class ${config.name} must define an async perform() method.`
      );
    }
    EramJob._job_definitions.push(config);
  }

  /** @type {Array<JobConfig>} */
  static _job_definitions = [];
}

/** Custom exception class for missing async perform method */
class EramError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EramError';
  }
}

module.exports = {
  EramJob
}


/**
 * Represents a configuration for a job.
 * @typedef {Object} JobConfig
 * @property {string} [filename] - Use import.meta.filename or __filename if you want to run the job in its own worker thread; otherwise the job will be scheduled on the main thread.
 * @property {string} [queue] - If not set, the 'default' queue will be used.
 * @property {string} [name] - defaults to the class name.
 * @property {number} [max_attempts=20] - Number of attempts by default.
 * @property {number} priority - Priority value.
 * @property {Object} unique - Object containing unique constraints for the job.
 * @property {number} unique.period - Number of seconds.
 * @property {string[]} [unique.args] - Arguments to consider; if not passed, all args are considered.
 */

