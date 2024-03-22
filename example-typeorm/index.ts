// typeorm imports
import "reflect-metadata"
import { DataSource } from "typeorm"
import { Photo } from "./PhotoEntity"
// eramjs imports
import { EmailUserJob } from "./EmailUserJob";
import { EramEgine } from '../..';

const datasource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  entities: [Photo],
  synchronize: true,
  logging: false,
  poolSize: 1000
})

const pg = (datasource.driver as any).postgres;
console.log(pg);

async function main() {
  await datasource.initialize();
  let result = await datasource.query('select 1 + 1;')
  console.log(result);


  const datasource2 = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
  })
  await datasource2.initialize();

  let repository = datasource2.getRepository(Photo);
  await repository.insert({
    name: new Date().toISOString(),
    description: '',
    filename: '',
    views: 0,
    isPublished: false
  });
  console.log({
    count: await repository.count()
  });

  await EramEgine.start({
    queues: {
      default: { limit: 20 },
      emails: { limit: 10 }
    },
    runInTransaction: fn => datasource.transaction(fn),
    connection: {
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
    }
  });

  await EmailUserJob.enqueue({ a: 1 });
}


// start main
main();

