import { DbService } from "../modules/db/db.service";
import { ValidateDto, } from "../modules/decorator/validateDto.decorator";
import { CreateProdutoDto } from "./dto/produto.create.dto";
import { PatchProdutoDto } from "./dto/produto.patch.dto";
import { PutProdutoDto } from "./dto/produto.put.dto";
import { ProdutoService } from "./produto.service";
import type { Request, Response } from 'express';


export class ProdutoController {

    private produtoService: ProdutoService;
    constructor(private dbService: DbService) {
        this.produtoService = new ProdutoService(this.dbService);
    }

    async findOne(id: number) {
        return await this.produtoService.findOne(id);
    }

    async findAll() {
        return await this.produtoService.findAll();
    }

    @ValidateDto(CreateProdutoDto)
    async create(req: Request, res: Response) {
        const dto = req.body as CreateProdutoDto;
        const result = await this.produtoService.create(dto);
        res.status(201).json(result);
    }

    async delete(id: number) {
        return await this.produtoService.delete(id);
    }

    @ValidateDto(PatchProdutoDto)
    async patch(req: Request, res: Response) {
        const dto = req.body as PatchProdutoDto;
        const result = await this.produtoService.patch(dto);
        res.status(200).json(result);
    }

    @ValidateDto(PutProdutoDto)
    async put(req: Request, res: Response) {
        const dto = req.body as PutProdutoDto;
        const result = await this.produtoService.put(dto);
        res.status(200).json(result);
    }

}