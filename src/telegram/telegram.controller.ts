import { Services } from "../route";


export class TelegramController {

    private readonly telegram: Services['telegram'];

    constructor(telegram: Services['telegram']) {
        this.telegram = telegram;
    }

    async getChats() {
        return await this.telegram.getChats();
    }

    async getNewMessages(chatId: string, ultimoId: number) {
        return await this.telegram.getNewMessages(chatId, ultimoId);
    }
}