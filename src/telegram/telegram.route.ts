import type { Route, RouteModule } from '../route';
import { TelegramController } from './telegram.controller';

export class TelegramRoute implements RouteModule {
  readonly prefix = '/telegram';

  constructor(private readonly telegramController: TelegramController) {}

  routes(): Route[] {
    return [
      {
        method: 'GET',
        path: '/chats',
        handler: async ({ res }) => {
          res.json(await this.telegramController.getChats());
        },
      },
      {
        method: 'GET', 
        path: '/messages',
        handler: async ({ req, res }) => {
          const { chatId, ultimoId } = req.query;
          res.json(await this.telegramController.getNewMessages(chatId as string, Number(ultimoId)));
        }
      }
    ];
  }
}
