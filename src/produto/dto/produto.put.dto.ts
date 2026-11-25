import { z } from 'zod';

export const PutProdutoDto = z.object({
     id: z.number().positive(),
  nome: z.string().min(1),
  preco: z.number().positive(),
  descricao: z.string().max(200).optional(),
});

export type PutProdutoDto = z.infer<typeof PutProdutoDto>;