import { z } from 'zod';

export const PatchProdutoDto = z.object({
    id: z.number().positive(),
  nome: z.string().min(1).optional(),
  preco: z.number().positive().optional(),
  descricao: z.string().max(200).optional(),
});

export type PatchProdutoDto = z.infer<typeof PatchProdutoDto>;