import { z } from 'zod';

export const CreateProdutoDto = z.object({
  nome: z.string().min(1),
  precoMax: z.number().positive(),
});

export type CreateProdutoDto = z.infer<typeof CreateProdutoDto>;