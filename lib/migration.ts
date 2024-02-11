import postgres, { type Row, type Sql } from 'postgres';

// const sql = postgres({ /* options */ })

export interface IMigration {
    up(opts: Record<string, any>): void;
    down(opts: Record<string, any>): void;
    migrated_version(): Promise<number>;
}


export class PgMigration implements IMigration {
    constructor(public sql: Sql) { }

    async up() {
        let version = await this.migrated_version();
        if (version < 1) {
            await this.up_v1();
        }
    }

    async up_v1() {
    }

    async migrated_version() {
        const prefix = 'public';
        const rows: Row[] = await this.sql`
SELECT description
FROM pg_class
LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_class.relname = 'eram_jobs'
AND pg_namespace.nspname = ${prefix}
        `;

        console.log(rows);
        if (rows.length) {
            const { description } = rows[0];
            return parseInt(description);
        }
        return 0;
    }

    down(opts: Record<string, any>): void {
        throw new Error('Method not implemented.');
    }
}

// TODO: SqliteMigration

