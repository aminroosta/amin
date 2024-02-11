import { expect, test } from "bun:test";
import { PgMigration } from "../lib/migration";
import postgres from "postgres";

test("2 + 2", async () => {
  const sql = postgres({user: 'postgres', password: 'postgres'});
  const migration = new PgMigration(sql);
  const version = await migration.migrated_version();
  expect(version).toBe(0);
});

