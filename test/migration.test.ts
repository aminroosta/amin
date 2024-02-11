import { expect, test } from "bun:test";
import { PgMigration } from "../lib/migration";
import postgres from "postgres";

test("PgMigration", async () => {
  const sql = postgres({ user: 'postgres', password: 'postgres' });
  const migration = new PgMigration(sql);

  await migration.down({ version: 1 });
  let version = await migration.current_version();
  expect(version).toBe(0);

  await migration.up({ version: 1 });
  version = await migration.current_version();
  expect(version).toBe(1);
});

