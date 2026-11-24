import type { ZodType } from 'zod';

type ResLike = { status(codigo: number): { json(corpo: unknown): unknown } };

export function ValidateDto<S extends ZodType>(schema: S) {
  return function <This, Req extends { body: unknown }, Res extends ResLike>(
    alvo: (this: This, req: Req, res: Res) => Promise<void>,
    _context: ClassMethodDecoratorContext,
  ) {
    return async function (this: This, req: Req, res: Res): Promise<void> {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erros: parsed.error.flatten() });
        return;
      }
      req.body = parsed.data; // validado e sem campos extras
      return alvo.call(this, req, res);
    };
  };
}