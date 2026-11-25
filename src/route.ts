import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Router, type Request, type Response, type NextFunction } from 'express';
import type { RedisService } from './modules/redis/redis.service';
import type { TelegramService } from './modules/telegram/telegram.service';
import { TelegramController } from './telegram/telegram.controller';
import { TelegramRoute } from './telegram/telegram.route';
import { DbService } from './modules/db/db.service';
import { ProdutoController } from './produto/produto.controller';
import { ProdutoRoute } from './produto/produto.route';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Services {
  redis: RedisService;
  telegram: TelegramService;
  db: DbService;
}

export interface RouteContext {
  req: Request;
  res: Response;
  services: Services;
}

export interface Route {
  method: HttpMethod;
  path: string;
  handler: (ctx: RouteContext) => unknown | Promise<unknown>;
}

/** Módulo de rotas baseado em classe (ex.: TelegramRoute), com controller injetado */
export interface RouteModule {
  /** Prefixo aplicado a todas as rotas do módulo (ex.: '/telegram') */
  prefix?: string;
  routes(): Route[];
}

/** Instancia os módulos de rotas, injetando os controllers/services */
export function buildModules(services: Services): RouteModule[] {
  return [
    new TelegramRoute(new TelegramController(services.telegram)),
    new ProdutoRoute(new ProdutoController(services.db)),
  ];
}

/** Achata os módulos em Route[], aplicando o prefixo de cada um */
export function loadModuleRoutes(modules: RouteModule[]): Route[] {
  return modules.flatMap((m) =>
    m.routes().map((r) => ({ ...r, path: joinPath(m.prefix, r.path) })),
  );
}

function joinPath(prefix = '', path: string): string {
  const joined = `/${prefix}/${path}`.replace(/\/+/g, '/');
  return joined.length > 1 ? joined.replace(/\/$/, '') : joined;
}

/** Helper para tipar os arquivos em src/routes */
export function defineRoutes(routes: Route[]): Route[] {
  return routes;
}

const ROUTES_DIR = join(__dirname, 'routes');

/** Carrega todos os arquivos .ts/.js de src/routes que exportam `default` com Route[] */
export function loadRoutes(dir = ROUTES_DIR): Route[] {
  const files = readdirSync(dir).filter(
    (f) => /\.(ts|js)$/.test(f) && !f.endsWith('.d.ts'),
  );

  const routes: Route[] = [];
  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(join(dir, file));
    const exported: Route | Route[] | undefined = mod.default ?? mod.routes;
    if (!exported) {
      console.warn(`[router] ${file} não exporta rotas, ignorado`);
      continue;
    }
    routes.push(...(Array.isArray(exported) ? exported : [exported]));
  }

  return routes;
}

/**
 * Monta um express.Router com as rotas de src/routes + as rotas dos módulos
 * (controllers), injetando os services.
 */
export function createRouter(services: Services, modules = buildModules(services)): Router {
  const routes = [...loadRoutes(), ...loadModuleRoutes(modules)];
  const router = Router();
  for (const r of routes) {
    console.log(`[router] ${r.method} ${r.path}`);
    const method = r.method.toLowerCase() as Lowercase<HttpMethod>;
    // Express 5 já repassa rejeições de handlers async para o error handler
    router[method](r.path, async (req: Request, res: Response) => {
      await r.handler({ req, res, services });
    });
  }
  return router;
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[http]', err);
  if (!res.headersSent) res.status(500).json({ error: (err as Error).message });
}
