import 'dotenv/config';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export interface MensagemCanal {
  chatId: string;
  messageId: number;
  text: string;
  date: Date;
}

export class TelegramService {
  private readonly apiId = Number(process.env.TG_API_ID);
  private readonly apiHash = process.env.TG_API_HASH!;
  private readonly session = new StringSession(process.env.TG_SESSION ?? '');
  private readonly client: TelegramClient;
  private readonly entidades = new Map<string, any>();

  constructor() {
    this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });
  }

  async connect() {
    await this.client.connect();
    if (!(await this.client.checkAuthorization())) {
      throw new Error(
        'Sessão ausente ou inválida. Rode src/listar-chats.ts para gerar TG_SESSION.',
      );
    }
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async getChats() {
    const dialogs = await this.client.getDialogs({ limit: 200 });
    const chats = [];
    for (const d of dialogs) {
      if (!d.isChannel && !d.isGroup) continue;
      const id = String(d.id);
      this.entidades.set(id, d.entity);
      chats.push({
        id,
        tipo: d.isChannel && !d.isGroup ? 'canal' : 'grupo',
        titulo: d.title ?? '',
        username: (d.entity as any)?.username as string | undefined,
      });
    }
    return chats;
  }

  async getNewMessages(chatId: string, ultimoId: number): Promise<MensagemCanal[]> {
    const entidade = this.entidades.get(chatId);
    if (!entidade) {
      throw new Error(`Chat ${chatId} desconhecido. Chame getChats() antes.`);
    }
    const msgs = await this.client.getMessages(entidade, {
      minId: ultimoId,
      limit: 100,
    });
    return msgs
      .filter((m) => m.message)
      .map((m) => ({
        chatId,
        messageId: m.id,
        text: m.message,
        date: new Date(m.date * 1000),
      }))
      .sort((a, b) => a.messageId - b.messageId);
  }
}