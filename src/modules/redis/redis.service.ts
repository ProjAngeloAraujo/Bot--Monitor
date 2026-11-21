import 'dotenv/config';
import { Redis } from 'ioredis';

export class RedisService {
  private readonly client: Redis;

  constructor(url = process.env.REDIS_URL ?? 'redis://localhost:6379') {
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    this.client.on('error', (err) => console.error('[redis]', err.message));
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.quit();
  }

  async ping() {
    return this.client.ping();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  /** Salva um valor; `ttlSegundos` opcional define expiração. */
  async set(key: string, value: string | number, ttlSegundos?: number) {
    if (ttlSegundos) {
      await this.client.set(key, value, 'EX', ttlSegundos);
    } else {
      await this.client.set(key, value);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async setJson(key: string, value: unknown, ttlSegundos?: number) {
    await this.set(key, JSON.stringify(value), ttlSegundos);
  }

  async del(...keys: string[]) {
    return this.client.del(...keys);
  }

  async exists(key: string) {
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, ttlSegundos: number) {
    return this.client.expire(key, ttlSegundos);
  }

  async incr(key: string) {
    return this.client.incr(key);
  }

  /** Acesso direto ao cliente ioredis para comandos não cobertos aqui. */
  get raw() {
    return this.client;
  }
}
