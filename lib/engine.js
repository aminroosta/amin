const { EramJob } = require('./job.js');
// import { WorkerPool } from './worker-pool';

/**
 * EramEngine manges core plugins, queues, workers and crons.
 * @example
 * const config = { ... }
 * const datasource = new DataSource(config);
 *
 * await datasource.initialize();
 * await EramEngine.start({
 *    queues: {
 *      default: { limit: 10 },
 *    },
 *    driver: {
 *       type: 'typeorm',
 *       config: config,
 *    },
 *    cron: [
 *      ['* * * * * ', MinuteWorker],
 *      ['0 * * * * ', HourlyWorker, { custom: 'arg' }]
 *    ]
 * });
 */
class EramEgine {
  /**
    * Start the job processing engine.
    * It will spin up a thread core plugins to run (Scheduler/Pruner/Lifeline/etc...).
    * The engine may spin up more threads for jobs with a filename.
    * @param [EngineConfig] config - configuration object for the engine
    */
  static async start({ queues }: Config) {
    // const pool = new WorkerPool();
    // pool.addWorker();
  }
}

module.exports = {
  EramEgine,
}

/**
 * Represents a configuration for the engine.
 * @typedef {Object} EngineConfig
 * @property {Object.<string, { limit: number }>} queues - Object containing queues with their limits
 * @property {Function} runInTransaction - Function that receives a function as parameter and returns a Promise
 * @param {Function} fn - Function that receives a driver and returns a Promise
 * @returns {Promise} Promise returned by the input function
 * @property {Object} [connection] - Optional object containing connection details
 * @property {number} [connection.port] - Port number
 * @property {string} [connection.username] - Username for connection
 * @property {string} [connection.password] - Password for connection
 * @property {string} [connection.database] - Database name for connection
 */
