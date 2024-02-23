export { EramJob } from './lib/job';
export { WorkerPool } from './lib/worker-pool';
export { start } from './lib/start';

/* pg */
// var client = {} as any;
// await client.query('SELECT $1::text as message', ['Hello world!'])
// client.query('LISTEN foo');
// client.on('notification', (msg: any) => { });

// client = await pool.connect()
// try {
//   await client.query('BEGIN')
//   // ...
//   await client.query('COMMIT')
// } catch (e) {
//   await client.query('ROLLBACK')
//   throw e
// } finally {
//   client.release()
// }

// postgres.js
// var sql = {} as any;
// await sql`SELECT ${'hello world!'} as message`;
// await sql.listen('news', payload => { });
// sql.notify('news', "...");
