import { ValidateDto, } from "../modules/decorator/validateDto.decorator";
import { CreateProdutoDto } from "./dto/produto.create.dto";
import { ProdutoService } from "./produto.service";
import type { Request, Response } from 'express';


export class ProdutoController {

    private produtoService: ProdutoService;
    constructor() {
        this.produtoService = new ProdutoService();
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

}