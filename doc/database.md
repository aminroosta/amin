The main advantages of Ecto are:
(1) the UI
(2) transactional consistency
(3) being ergonomic


Unlike Ecto, there is no de-facto ORM for JavaScript.
(1) https://github.com/brianc/node-postgres i.e, pg
(2) https://github.com/typeorm/typeorm uses pg
(3) https://github.com/porsager/postgres
(4) https://github.com/prisma/prisma could use pg https://github.com/prisma/prisma/tree/main/packages/adapter-pg / https://github.com/prisma/prisma/tree/main/packages/driver-adapter-utils
(5) https://github.com/knex/knex uses pg
(6) https://github.com/sequelize/sequelize uses pg
(7) https://github.com/bookshelf/bookshelf uses knex
(8) https://github.com/Vincit/objection.js uses knex
(9) https://github.com/drizzle-team/drizzle-orm uses pg or postgres.js

pg example:
-----
client = await pool.connect()
await client.query('SELECT $1::text as message', ['Hello world!'])
client.query('LISTEN foo');
client.on('notification', (msg: any) => { });

try {
  await client.query('BEGIN')
  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
}


driver-adapter design:
-----
export interface ResultSet {
  columnNames: Array<string>
  rows: Array<Array<unknown>>
}

export type Query = {
  sql: string
  args: Array<unknown>
}

export type Error =
  | {
      kind: 'GenericJs'
      id: number
    }
  | {
      kind: 'Postgres'
      code: string
      severity: string
      message: string
      detail: string | undefined
      column: string | undefined
      hint: string | undefined
    }

export interface Queryable {
  queryRaw(params: Query): Promise<Result<ResultSet>>
  executeRaw(params: Query): Promise<Result<number>>

  listen(channel: string, callback: Function): Promise<Result<void>>
}

export interface DriverAdapter extends Queryable {
  startTransaction(): Promise<Result<Transaction>>
}

export interface Transaction extends Queryable {
  commit(): Promise<Result<void>>
  rollback(): Promise<Result<void>>
}


defining jobs
-----
class EramJob {
  static register(opts: object) { ... }
  static async enqueue(args: object) {
    const name = this.name;
  }
}
class EmailUserJob extends EramJob {
  static {
    EmailUserJob.register({ queue: 'emails' });
  }

  async perform(args, opts) {
    console.log(args);
  }
}
await EmailUserJob.enqueue({email: 'a@b.c'});

