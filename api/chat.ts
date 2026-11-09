import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
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

interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'model';
  text: string;
}

/**
 * Salva a chave no arquivo .env local se estiver em ambiente de desenvolvimento local
 */
function tryPersistKeyToEnv(key: string, provider: 'GEMINI' | 'OPENAI') {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf-8');
      const varName = `${provider}_API_KEY`;
      if (content.includes(`${varName}=`)) {
        content = content.replace(new RegExp(`${varName}=.*`), `${varName}=${key}`);
      } else {
        content += `\n${varName}=${key}\n`;
      }
      fs.writeFileSync(envPath, content, 'utf-8');
      process.env[varName] = key;
    }
  } catch (err: any) {
    console.warn('[Env Persist Warning]:', err.message);
  }
}

/**
 * Endpoint Serverless: POST /api/chat
 * Cérebro de IA GENERATIVA REAL para o Personal OS de Bruno Pinho.
 * Utiliza LLM (Google Gemini 1.5/2.0 Flash ou OpenAI GPT-4o-mini).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-openai-key');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    return sendJson(200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(405, { error: 'Método não permitido. Utilize POST.' });
  }

  try {
    // 1. Parsing do corpo da requisição
    let body = req.body;
    if (!body || typeof body !== 'object') {
      if (typeof body === 'string' && body.trim()) {
        try { body = JSON.parse(body); } catch {}
      } else if (typeof (req as any)[Symbol.asyncIterator] === 'function') {
        const buffers: any[] = [];
        for await (const chunk of req) buffers.push(chunk);
        if (buffers.length > 0) {
          try { body = JSON.parse(Buffer.concat(buffers).toString() || '{}'); } catch {}
        }
      }
    }

    // 2. Chaves de API (Header, Body ou Env)
    const reqHeaders = req.headers || {};
    const headerGemini = (reqHeaders['x-gemini-key'] as string) || '';
    const headerOpenAI = (reqHeaders['x-openai-key'] as string) || '';
    const bodyGemini = body?.geminiApiKey || body?.apiKey || '';
    const bodyOpenAI = body?.openAiApiKey || '';

    let geminiKey = (headerGemini || bodyGemini || process.env.GEMINI_API_KEY || '').trim();
    let openAiKey = (headerOpenAI || bodyOpenAI || process.env.OPENAI_API_KEY || '').trim();

    // Se o usuário enviou uma chave pelo chat ou header, salva no .env local
    if (headerGemini || bodyGemini) {
      tryPersistKeyToEnv(geminiKey, 'GEMINI');
    }
    if (headerOpenAI || bodyOpenAI) {
      tryPersistKeyToEnv(openAiKey, 'OPENAI');
    }

    // 3. Caso seja apenas uma verificação de chave
    if (body?.action === 'verify_key') {
      if (geminiKey) {
        try {
          const testRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Responda apenas "OK" em uma palavra.' }] }]
              })
            }
          );
          if (testRes.ok) {
            return sendJson(200, { success: true, provider: 'gemini', message: 'Chave Gemini validada com sucesso!' });
          } else {
            const errData = await testRes.json().catch(() => ({}));
            return sendJson(400, { success: false, error: 'Chave Gemini inválida.', details: errData });
          }
        } catch (e: any) {
          return sendJson(500, { success: false, error: 'Erro ao conectar ao Google Gemini.', details: e.message });
        }
      }

      if (openAiKey) {
        try {
          const testRes = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${openAiKey}` }
          });
          if (testRes.ok) {
            return sendJson(200, { success: true, provider: 'openai', message: 'Chave OpenAI validada com sucesso!' });
          } else {
            return sendJson(400, { success: false, error: 'Chave OpenAI inválida.' });
          }
        } catch (e: any) {
          return sendJson(500, { success: false, error: 'Erro ao conectar à OpenAI.', details: e.message });
        }
      }

      return sendJson(400, { success: false, error: 'Nenhuma chave fornecida para teste.' });
    }

    const message = (body?.message || body?.prompt || '').trim();
    if (!message) {
      return sendJson(400, { error: 'Mensagem é obrigatória.' });
    }

    const context = body?.context || {};
    const userName = context.userName || 'Bruno Pinho';
    const activeProjects = Array.isArray(context.activeProjects) ? context.activeProjects : ['Littera', 'Aura'];
    const pendingTasks = Array.isArray(context.pendingTasks) ? context.pendingTasks : [];
    const parkedCount = context.parkedCount || 0;
    const history: ChatHistoryItem[] = Array.isArray(body?.history) ? body.history : [];

    // 4. Se não há chave de IA configurada, orienta transparentemente o usuário
    if (!geminiKey && !openAiKey) {
      return sendJson(200, {
        requiresKey: true,
        reply: `Olá, **${userName}**! Para conversarmos usando **Inteligência Artificial Generativa real** (e não respostas automáticas de chatbot), você só precisa adicionar uma chave de API gratuita do **Google Gemini** (ou da OpenAI).\n\n🔹 **Como obter gratuitamente em 30 segundos:**\n1. Acesse **[Google AI Studio](https://aistudio.google.com/app/apikey)**\n2. Clique em *"Create API key"*\n3. Copie e cole no botão **"Configurar Chave de IA"** no topo deste chat.\n\nDepois disso, terei raciocínio generativo completo sobre suas empresas (**Littera** e **Aura**), estratégias e metas!`,
        provider: 'none',
        suggestedPrompts: [
          'Como configurar minha chave?',
          'O que a IA Generativa pode fazer?',
          'Meus projetos ativos'
        ]
      });
    }

    const allProjects = Array.isArray(context.allProjects) ? context.allProjects : [];

    const taskListFormatted = pendingTasks
      .slice(0, 15)
      .map((t: any) => `  - [${t.area || 'Geral'}] "${t.title || t}" (prioridade: ${t.priority || 'media'}, ${t.minutes || 25}min)`)
      .join('\n');

    const projectListFormatted = allProjects
      .slice(0, 12)
      .map((p: any) => `  - [${p.area || 'Geral'}] "${p.title || p.name}" (${p.locked ? 'Trancado' : 'Ativo'})`)
      .join('\n');

    const systemPrompt = `Você é a Inteligência Artificial integrada ao dashboard pessoal de ${userName}.
Seu papel é conversar naturalmente com ${userName}, ajudar a pensar e gerar ideias livremente, e alterar o dashboard (tarefas e projetos) quando solicitado.

COMO CONVERSAR:
1. Seja natural, fluido, criativo e direto. Converse como um parceiro inteligente (estilo ChatGPT/Claude).
2. Sem excesso de informações: dê respostas enxutas, claras e fáceis de ler. Nunca envie paredes de texto desnecessárias.
3. Liberdade total para ideias: se o usuário pedir ideias, brainstorming, sugestões de projetos, negócios, estudos ou tarefas, gere ideias criativas e converse abertamente sobre elas. NUNCA bloqueie ideias nem dê sermões sobre foco ou TDAH.
4. Só altere o dashboard (criar/editar/excluir tarefas ou projetos) quando o usuário pedir para fazer isso ou confirmar uma sugestão sua. Se ele estiver apenas conversando ou pedindo ideias, apenas converse normalmente sem disparar ações sozinho.

PODER DE ALTERAR O DASHBOARD:
Quando o usuário pedir para criar, alterar, concluir ou remover algo no dashboard, inclua no final da sua resposta um bloco \`\`\`action com um objeto JSON (ou uma lista JSON \`[...]\` se forem várias alterações de uma vez):

Tipos de ações disponíveis:
- Criar tarefa:
  {"type": "create_task", "title": "Título", "area": "Littera" | "Aura" | "IDP" | "Pessoal", "priority": "urgente" | "alta" | "media" | "baixa", "estimated_minutes": 25, "description": "opcional"}
- Editar tarefa existente:
  {"type": "update_task", "searchTitle": "parte do título atual", "title": "Novo título", "priority": "alta", "area": "Aura", "estimated_minutes": 30}
- Concluir tarefa:
  {"type": "complete_task", "searchTitle": "parte do título da tarefa"}
- Excluir/Apagar tarefa:
  {"type": "delete_task", "searchTitle": "parte do título da tarefa"}
- Criar projeto:
  {"type": "create_project", "title": "Nome do Projeto", "area": "Littera" | "Aura" | "IDP" | "Pessoal", "description": "Descrição", "nextStep": "Próximo passo", "locked": false}
- Editar projeto existente:
  {"type": "update_project", "searchTitle": "parte do nome atual", "title": "Novo nome", "description": "Nova descrição", "nextStep": "Novo próximo passo", "locked": false}
- Excluir/Apagar projeto:
  {"type": "delete_project", "searchTitle": "parte do nome do projeto"}
- Colocar tarefa em foco no topo do dia:
  {"type": "start_focus", "searchTitle": "parte do título da tarefa"}
- Mudar aba da tela:
  {"type": "navigate", "tab": "hoje" | "tarefas" | "projetos" | "estudos"}

ESTADO ATUAL DO DASHBOARD DE ${userName.toUpperCase()}:
Projetos (${allProjects.length}):
${projectListFormatted || '  - Nenhum projeto cadastrado'}

Tarefas Pendentes (${pendingTasks.length}):
${taskListFormatted || '  - Nenhuma tarefa pendente'}`;

    // --------------------------------------------------------------------------
    // 6. Chamada à API Generativa: Google Gemini (Modelo Flash ultra rápido)
    // --------------------------------------------------------------------------
    if (geminiKey) {
      try {
        // Monta o histórico no formato oficial da API do Gemini
        const contents: any[] = [];

        // Adiciona mensagens anteriores do histórico (últimas 8 para contexto enxuto)
        const recentHistory = history.slice(-8);
        for (const item of recentHistory) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }

        // Adiciona mensagem atual do usuário
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const candidateModels = [
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-flash-latest'
        ];

        for (const model of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: systemPrompt }]
                  },
                  contents,
                  generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 1000
                  }
                })
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

              if (reply) {
                return sendJson(200, {
                  success: true,
                  reply: reply.trim(),
                  provider: 'gemini',
                  model,
                  suggestedPrompts: [
                    'Como destravar meu próximo passo?',
                    'O que priorizar no Littera hoje?',
                    'Me ajude a estruturar um plano de 3 passos'
                  ]
                });
              }
            } else {
              const errBody = await geminiRes.json().catch(() => ({}));
              console.warn(`[Gemini Model ${model} failed]:`, geminiRes.status, errBody?.error?.message);
            }
          } catch (modelErr: any) {
            console.warn(`[Gemini Model ${model} exception]:`, modelErr.message);
          }
        }
      } catch (geminiErr: any) {
        console.error('[Gemini Execution Error]:', geminiErr.message);
      }
    }

    // --------------------------------------------------------------------------
    // 7. Chamada à API Generativa: OpenAI (GPT-4o-mini)
    // --------------------------------------------------------------------------
    if (openAiKey) {
      try {
        const messagesPayload: any[] = [
          { role: 'system', content: systemPrompt }
        ];

        for (const item of history.slice(-8)) {
          messagesPayload.push({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: item.text
          });
        }

        messagesPayload.push({ role: 'user', content: message });

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const reply = aiData.choices?.[0]?.message?.content;
          if (reply) {
            return sendJson(200, {
              success: true,
              reply: reply.trim(),
              provider: 'openai',
              model: 'gpt-4o-mini'
            });
          }
        }
      } catch (openAiErr: any) {
        console.error('[OpenAI Execution Error]:', openAiErr.message);
      }
    }

    // Se houve falha nas chamadas externas
    return sendJson(500, {
      error: 'Não foi possível gerar a resposta com a IA no momento. Verifique a chave de API ou a conexão.',
      requiresKey: true
    });
  } catch (error: any) {
    console.error('[API /api/chat Fatal Error]:', error);
    return sendJson(500, {
      error: error.message || 'Erro interno no chat generativo.'
    });
  }
}
