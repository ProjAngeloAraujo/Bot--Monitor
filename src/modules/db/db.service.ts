
import { Pool, QueryResultRow } from "pg";


export class DbService {

    private readonly pool = new Pool({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    async connect() {
        await this.pool.connect();
    }

    async disconnect() {
        await this.pool.end();
    }

    async queryPool(): Promise<Pool> {
        return this.pool;
    }

    async query<T extends QueryResultRow>(
        query: string,
        params?: unknown[],
        ): Promise<T[]> {
        const result = await this.pool.query<T>(query, params);
        return result.rows;
    }

    async queryOne<T extends QueryResultRow>(
        query: string,
        params?: unknown[],
        ): Promise<T | null> {
        const result = await this.pool.query<T>(query, params);
        return result.rows[0] ?? null;
    }

   async queryValue<T>(query: string, params?: unknown[]): Promise<T | null> {
        const result = await this.pool.query<unknown[]>({
            text: query,
            values: params,
            rowMode: 'array',
        });
        const valor = result.rows[0]?.[0];
        return (valor ?? null) as T | null;
    }

    async queryCount(query: string, params?: any[]): Promise<number> {
        const result = await this.pool.query<{ count: string }>(query, params);
        return Number(result.rows[0]?.count ?? 0);
    }

    async queryExists(query: string, params?: any[]): Promise<boolean> {
        const result = await this.pool.query<{ exists: boolean }>(query, params);
        return result.rows[0]?.exists ?? false;
    }

    async queryTransaction<T extends QueryResultRow>(queries: { query: string; params?: any[] }[]): Promise<T[]> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const results: T[] = [];
            for (const { query, params } of queries) {
                const result = await client.query<T>(query, params);
                results.push(...result.rows);
            }
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async queryTransactionOne<T extends QueryResultRow>(queries: { query: string; params?: any[] }[]): Promise<T | null> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            let result: T | null = null;
            for (const { query, params } of queries) {
                const res = await client.query<T>(query, params);
                result = res.rows[0] ?? null;
            }
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async queryUpdate(query: string, params?: any[]): Promise<number> {
        const result = await this.pool.query(query, params);
        return Number(result.rowCount ?? 0);
    }

    async queryDelete(query: string, params?: any[]): Promise<number> {
        const result = await this.pool.query(query, params);
        return Number(result.rowCount ?? 0);
    }

    async queryInsert(query: string, params?: any[]): Promise<number> {
        const result = await this.pool.query(query, params);
        return Number(result.rowCount ?? 0);
    }

}