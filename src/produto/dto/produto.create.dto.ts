import { z } from 'zod';

export const CreateProdutoDto = z.object({
  nome: z.string().min(1),
  preco: z.number().positive(),
  descricao: z.string().max(200).optional(),
});

export type CreateProdutoDto = z.infer<typeof CreateProdutoDto>;