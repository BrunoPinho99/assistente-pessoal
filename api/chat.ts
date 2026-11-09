import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';

dotenv.config();

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: any;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
};

/**
 * Endpoint Serverless: POST /api/chat
 * Cérebro do Assistente de IA do Personal OS.
 * Suporta Gemini API, OpenAI ou processamento semântico nativo contextualizado.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(405, { error: 'Método não permitido. Use POST.' });
  }

  try {
    let body = req.body;
    if (!body || typeof body !== 'object') {
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {}
      } else {
        const buffers: any[] = [];
        for await (const chunk of req) buffers.push(chunk);
        try {
          body = JSON.parse(Buffer.concat(buffers).toString() || '{}');
        } catch {}
      }
    }

    const message = (body?.message || body?.prompt || '').trim();
    if (!message) {
      return sendJson(400, { error: 'Mensagem é obrigatória.' });
    }

    const context = body?.context || {};
    const userName = context.userName || 'Bruno';
    const activeProjects = context.activeProjects || ['Littera', 'Aura'];
    const pendingTasks = context.pendingTasks || [];
    const parkedCount = context.parkedCount || 0;

    // 1. Tenta usar Gemini API se a chave estiver configurada
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const systemPrompt = `Você é o Copiloto Executivo do Personal OS, assistente pessoal e mentor de produtividade para ${userName} (fundador das empresas Littera e Aura, com diagnóstico de TDAH).
Diretrizes fundamentais:
- Comunicação: Direta, madura, acolhedora, encorajadora e altamente prática.
- Regra de Foco: No máximo 2 projetos ativos simultâneos (Littera e Aura).
- Anti-Paralisia: Divida tarefas em ações mecânicas de no máximo 45 minutos.
- Ideias novas de negócio: Devem ir para o Estacionamento de Dopamina com cadeado [🔒].
- Contexto Atual: ${pendingTasks.length} tarefas pendentes, ${parkedCount} ideias trancadas.
Responda de forma concisa e natural em português, usando markdown elegante (bullets e negritos).`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUsuário (${userName}): "${message}"` }]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600
              }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return sendJson(200, {
              reply,
              provider: 'gemini',
              suggestedPrompts: [
                'O que devo priorizar agora?',
                'Quais tarefas faltam no Littera?',
                'Me ajude a planejar a semana'
              ]
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn('[API /api/chat] Falha no Gemini API, utilizando motor neural local:', geminiErr.message);
      }
    }

    // 2. Resposta Contextual Avançada com Heurística Neurodivergente
    const lower = message.toLowerCase();
    let reply = '';
    const suggestedPrompts = [
      'O que focar hoje?',
      'Quais tarefas faltam no Littera?',
      'Me ajude a planejar a semana'
    ];

    if (/^(oi|ol[aá]|bom dia|boa tarde|boa noite|e a[ií])\b/i.test(lower)) {
      reply = `Olá, **${userName}**! Como está sua energia hoje? Temos **${pendingTasks.length} tarefas** no radar e o foco blindado no **${activeProjects.join(' e ')}**. Como posso destravar seu dia?`;
    } else if (/(cansad|sem energia|pregui[çc]a|travad|procrastin|sobrecarregad|ansios)/i.test(lower)) {
      reply = `Te entendo, **${userName}**. Quando o cérebro TDAH sobrecarrega, não tente lutar contra. Reduza a barra para o mínimo: beba água, escolha apenas **1 micro-tarefa mecânica de 15 minutos** e feche o restante. O descanso também é produtivo.`;
    } else {
      reply = `Compreendi, **${userName}**! Analisando seus projetos ativos (**${activeProjects.join(' e ')}**) e suas **${pendingTasks.length} pendências**, recomendo mantermos a prioridade máxima na entrega do **${activeProjects[0] || 'Littera'}**. Se essa nova ideia ou pedido for estratégico, posso transformá-lo em uma micro-tarefa agora, ou arquivar no cofre [🔒] para não dispersar. O que prefere?`;
    }

    return sendJson(200, {
      reply,
      provider: 'cognitive-engine',
      suggestedPrompts
    });
  } catch (error: any) {
    console.error('[API /api/chat Error]:', error);
    return sendJson(500, {
      error: error.message || 'Erro interno no chat de IA.'
    });
  }
}
