import { defineRoutes } from '../route';

export default defineRoutes([
  {
    method: 'GET',
    path: '/chats',
    handler: async ({ res, services }) => {
      res.json(await services.telegram.getChats());
    },
  },
]);
