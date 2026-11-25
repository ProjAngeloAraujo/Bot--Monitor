import { DbService } from "../modules/db/db.service";
import { CreateProdutoDto } from "./dto/produto.create.dto";
import { PatchProdutoDto } from "./dto/produto.patch.dto";
import { PutProdutoDto } from "./dto/produto.put.dto";

export class ProdutoService {
  constructor(private dbService: DbService) {}

  async findOne(id: number) {
    const row = await this.dbService.queryOne(
      `SELECT * FROM produto WHERE id = $1`,
      [id],
    );
    if (!row) throw new Error("Produto não encontrado");
    return row;
  }

  async findAll() {
    const rows = await this.dbService.query(`SELECT * FROM produto`);
    if (rows.length === 0) throw new Error("Nenhum produto encontrado");
    return rows;
  }

  async create(dto: CreateProdutoDto): Promise<{ id: number }> {
    const row = await this.dbService.queryOne<{ id: number }>(
      `INSERT INTO produto (nome, preco, descricao)
     VALUES ($1, $2, $3)
     RETURNING id`,
      [dto.nome, dto.preco, dto.descricao ?? null],
    );

    if (!row) throw new Error("Falha ao inserir produto");
    return row;
  }

  async delete(id: number) {
    const row = await this.dbService.queryOne(
      "DELETE FROM produto WHERE id = $1 RETURNING id",
      [id],
    );
    if (!row) throw new Error("Produto não encontrado");
    return row;
  }

  async patch(dto: PatchProdutoDto) {
    const { id, ...campos } = dto;

    const colunas = ["nome", "preco", "descricao"] as const;

    const sets: string[] = [];
    const valores: unknown[] = [];

    for (const coluna of colunas) {
      const valor = campos[coluna];
      if (valor !== undefined) {
        valores.push(valor);
        sets.push(`${coluna} = $${valores.length}`);
      }
    }

    if (sets.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    valores.push(id);
    const row = await this.dbService.queryOne<{ id: number }>(
      `UPDATE produto SET ${sets.join(", ")} WHERE id = $${valores.length} RETURNING id`,
      valores,
    );

    if (!row) throw new Error("Produto não encontrado");
    return row;
  }

  async put(dto: PutProdutoDto) {
    const row = await this.dbService.queryOne<{ id: number }>(
      `UPDATE produto
        SET nome = $1,
            preco = $2,
            descricao = $3
      WHERE id = $4
  RETURNING id`,
      [dto.nome, dto.preco, dto.descricao ?? null, dto.id],
    );

    if (!row) throw new Error("Produto não encontrado");
    return row;
  }

}