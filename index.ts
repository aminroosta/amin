console.log("Hello via Bun!");

var eram = {} as any;
const emailUserJob = eram.registerJob('EamilUserJob', ({ email, rank }: { email: string, rank: number }) => {
  console.log({ email, rank });
});


emailUserJob.enqueue({ email: 'a@b.c', rank: 5 });

interface IJob<T = {}> {
  perform(args: T): any;
}


class EmailUserJob {
  static {
    eram.register(EmailUserJob, {
      queue: 'emails',
      priority: 3,
      max_attempts: 3,
      tags: ["business"],
      unique: { period: 30 }
    });
  }

  // static enqueue(email: string, rank: number) {
  //   eram.enqueueJob(EmailUserJob, { email, rank });
  // }

  async perform({ email, rank }: { email: string, rank: number }) {
    console.log({ email, rank });
  }
}



// eram.enqueue(new EmailUserJob({ email: 'a@b.c', rank: 5 }));

eram.enqueue(EmailUserJob, { email: 'a@b.c', rank: 5 });



/* pg */
var client = {} as any;
await client.query('SELECT $1::text as message', ['Hello world!'])
client.query('LISTEN foo');
client.on('notification', (msg: any) => { });

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
var sql = {} as any;
await sql`SELECT ${'hello world!'} as message`;
await sql.listen('news', payload => { });
sql.notify('news', "...");
