import cron, { type ScheduledTask } from 'node-cron';
import { TelegramService } from '../modules/telegram/telegram.service';
import { DbService } from '../modules/db/db.service';

const INTERVALO_CHATS_MS = 10 * 60_000; // atualiza a lista de chats a cada 10 min

type Fonte = { chat_id: string; ultimo_message_id: string }; // bigint vem como string

export class SyncTelegramJob {
  private tarefa?: ScheduledTask;
  private rodando = false;
  private ultimaSyncChats = 0;

  constructor(
    private readonly telegram: TelegramService,
    private readonly db: DbService,
  ) {}

  iniciar(): void {
    if (this.tarefa) return;
    this.tarefa = cron.schedule(
      '*/15 * * * * *', // a cada 15 segundos
      () => void this.executar(),
      { timezone: 'America/Sao_Paulo' },
    );
    console.log('[sync] job iniciado');
  }

  parar(): void {
    this.tarefa?.stop();
    this.tarefa = undefined;
    console.log('[sync] job parado');
  }

  private async executar(): Promise<void> {
    if (this.rodando) return;
    this.rodando = true;
    try {
      if (Date.now() - this.ultimaSyncChats > INTERVALO_CHATS_MS) {
        await this.sincronizarChats();
        this.ultimaSyncChats = Date.now();
      }
      await this.sincronizarMensagens();
    } catch (e) {
      console.error('[sync] erro:', e);
    } finally {
      this.rodando = false;
    }
  }

  // insere chats novos e mantém o título atualizado
  private async sincronizarChats(): Promise<void> {
    const chats = await this.telegram.getChats();
    for (const chat of chats) {
      await this.db.query(
        `INSERT INTO sources (chat_id, titulo)
         VALUES ($1, $2)
         ON CONFLICT (chat_id) DO UPDATE SET titulo = EXCLUDED.titulo`,
        [String(chat.id), chat.titulo ?? null],
      );
    }
    console.log(`[sync] ${chats.length} chats sincronizados`);
  }

  // lê mensagens novas dos chats ativos
  private async sincronizarMensagens(): Promise<void> {
    const fontes = await this.db.query<Fonte>(
      `SELECT chat_id, ultimo_message_id FROM sources WHERE ativo`,
    );

    for (const fonte of fontes) {
      try {
        const mensagens = await this.telegram.getNewMessages(
          fonte.chat_id,
          Number(fonte.ultimo_message_id),
        );
        if (mensagens.length === 0) continue;

        // um insert só por chat
        await this.db.query(
          `INSERT INTO messages (chat_id, message_id, texto, data)
           SELECT $1, * FROM unnest($2::bigint[], $3::text[], $4::timestamptz[])
           ON CONFLICT (chat_id, message_id) DO NOTHING`,
          [
            fonte.chat_id,
            mensagens.map((m) => m.messageId),
            mensagens.map((m) => m.text ?? null),
            mensagens.map((m) => m.date),
          ],
        );

        const maiorId = Math.max(...mensagens.map((m) => m.messageId));
        await this.db.query(
          `UPDATE sources
              SET ultimo_message_id = GREATEST(ultimo_message_id, $2)
            WHERE chat_id = $1`,
          [fonte.chat_id, maiorId],
        );
      } catch (e) {
        // erro em um chat não impede os outros
        console.error(`[sync] chat ${fonte.chat_id}:`, e);
      }
    }
  }
}
