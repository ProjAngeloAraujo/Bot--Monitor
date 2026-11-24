import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Pool } from 'pg';

const LOCK_ID = 727274; 

export async function rodarMigrations(
  pool: Pool,
  pasta = join(process.cwd(), 'migrations'),
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`
      create table if not exists schema_migrations (
        nome text primary key,
        aplicada_em timestamptz not null default now()
      )`);

    const { rows } = await client.query<{ nome: string }>(
      'select nome from schema_migrations',
    );
    const aplicadas = new Set(rows.map((r) => r.nome));

    const arquivos = (await readdir(pasta)).filter((a) => a.endsWith('.sql')).sort();

    for (const arquivo of arquivos) {
      if (aplicadas.has(arquivo)) continue;
      const sql = await readFile(join(pasta, arquivo), 'utf8');
      try {
        await client.query('begin');
        await client.query(sql);
        await client.query('insert into schema_migrations (nome) values ($1)', [arquivo]);
        await client.query('commit');
        console.log(`[migrate] aplicada: ${arquivo}`);
      } catch (e) {
        await client.query('rollback');
        throw new Error(`Falha na migration ${arquivo}: ${(e as Error).message}`);
      }
    }
  } finally {
    await client.query('select pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}