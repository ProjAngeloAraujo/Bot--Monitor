import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH ?? '';
const session = new StringSession(process.env.TG_SESSION ?? '');

function salvarSessaoNoEnv(sessao: string) {
  const caminho = '.env';
  let conteudo = existsSync(caminho) ? readFileSync(caminho, 'utf8') : '';
  const linhaSessao = /^TG_SESSION=.*$/m;

  if (linhaSessao.test(conteudo)) {
    conteudo = conteudo.replace(linhaSessao, () => `TG_SESSION=${sessao}`);
  } else {
    if (conteudo && !conteudo.endsWith('\n')) conteudo += '\n';
    conteudo += `TG_SESSION=${sessao}\n`;
  }

  writeFileSync(caminho, conteudo);
}

async function main() {
  if (!apiId || !apiHash) {
    console.error(
      'Preencha TG_API_ID e TG_API_HASH no .env (my.telegram.org) e rode de novo.',
    );
    process.exit(1);
  }

  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text('Telefone (+55...): '),
    password: async () => await input.text('Senha 2FA (se tiver): '),
    phoneCode: async () => await input.text('Código recebido no Telegram: '),
    onError: (err) => console.log(err),
  });

  // Grava a sessão direto no .env (não imprime no terminal).
  salvarSessaoNoEnv(String(client.session.save()));
  console.log('\nLogin feito. TG_SESSION foi salvo no .env.');

  console.log('\nCANAIS E GRUPOS DA CONTA:');
  const dialogs = await client.getDialogs({ limit: 200 });
  for (const d of dialogs) {
    if (!d.isChannel && !d.isGroup) continue;
    const tipo = d.isChannel && !d.isGroup ? 'canal' : 'grupo';
    const user = (d.entity as any)?.username;
    console.log(`${d.id} | ${tipo} | ${d.title}${user ? ' | @' + user : ''}`);
  }

  await client.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Falha no login:', err);
  process.exit(1);
});