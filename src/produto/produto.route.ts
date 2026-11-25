import { Route, RouteModule } from "../route";
import { CreateProdutoDto } from "./dto/produto.create.dto";
import { ProdutoController } from "./produto.controller";


export class ProdutoRoute implements RouteModule {
    
readonly prefix = '/produto';

    constructor(private readonly produtoController: ProdutoController) {}

    routes(): Route[] {
        return [
            {
                method: 'GET',
                path: '/produto',
                handler: async ({ req, res }) => {
                    const { Id } = req.query;
                    res.status(200).json(await this.produtoController.findOne(Number(Id)));
                }
            },
            {
                method: 'GET',
                path: '/produtos',
                handler: async ({ req, res }) => {
                    res.status(200).json(await this.produtoController.findAll());
                }
            },
            {
                method: 'POST',
                path: '/produto',
                handler: async ({ req, res }) => {
                    res.status(201).json(await this.produtoController.create(req, res));
                }
            },
            {
                method: 'DELETE',
                path: '/produto',
                handler: async ({ req, res }) => {
                    const { Id } = req.query;
                    res.status(200).json(await this.produtoController.delete(Number(Id)));
                }
            },
            {
                method: 'PATCH',
                path: '/produto',
                handler: async ({ req, res }) => {
                    res.status(200).json(await this.produtoController.patch(req, res));
                }
            },
            {
                method: 'PUT',
                path: '/produto',
                handler: async ({ req, res }) => {
                    res.status(200).json(await this.produtoController.put(req, res));
                }
            },
        ]
    }

}