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
                    res.json(await this.produtoController.findOne(Number(Id)));
                }
            },
            {
                method: 'GET',
                path: '/produtos',
                handler: async ({ req, res }) => {
                    res.json(await this.produtoController.findAll());
                }
            },
            {
                method: 'POST',
                path: '/produto',
                handler: async ({ req, res }) => {
                    res.json(await this.produtoController.create(req, res));
                }
            },
        ]
    }

}