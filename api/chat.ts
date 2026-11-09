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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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

    // 5. System Prompt Especializado de Alto Nível
    const systemPrompt = `Você é o Copiloto Executivo e Mentor de Alta Performance do Personal OS de ${userName}.
${userName} é fundador e líder das empresas Littera (EdTech / Leitura Adaptativa) e Aura (Studio Digital / Branding Tech), e possui diagnóstico de TDAH.

SUA MISSÃO E PERSONALIDADE:
- Você é uma IA GENERATIVA genuína, inteligente, sagaz, empática, articulada e prática. Converse naturalmente como um conselheiro executivo sênior e parceiro de negócios.
- Compreensão profunda de Neurociência & TDAH: você entende de paralisia de análise, hiperfoco, ciclos de dopamina, sobrecarga executiva e esgotamento.
- Princípio da Blindagem de Foco: Máximo de 2 projetos ativos simultâneos (${activeProjects.join(' e ')}). Novas ideias de negócio devem ser acolhidas com entusiasmo, mas imediatamente direcionadas ao "Estacionamento de Dopamina" com cadeado [🔒] para não canibalizar a execução.
- Quebra mecânica de tarefas: Sempre que for sugerir ações, proponha blocos de 15 a 45 minutos ("micro-ações").
- Contexto Atual de ${userName}:
  • Empresas Ativas: ${activeProjects.join(', ')}
  • Tarefas pendentes no backlog: ${pendingTasks.length} (${pendingTasks.slice(0, 5).map((t: any) => t.title || t).join('; ')})
  • Ideias salvas no Estacionamento de Dopamina: ${parkedCount}

DIRETRIZES DE FORMATAÇÃO:
- Escreva em português do Brasil de forma elegante e limpa.
- Use markdown moderado (negritos e listas com tópicos).
- Seja direto ao ponto, evitando enrolação corporativa ou formalidades excessivas.
- Mantenha continuidade com as mensagens anteriores da conversa.`;

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

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
              model: 'gemini-1.5-flash',
              suggestedPrompts: [
                'Como destravar meu próximo passo?',
                'O que priorizar no Littera hoje?',
                'Me ajude a estruturar um plano de 3 passos'
              ]
            });
          }
        } else {
          const errBody = await geminiRes.json().catch(() => ({}));
          console.error('[Gemini API Error Status]:', geminiRes.status, errBody);
          // Se erro de cota ou modelo 1.5-flash, tenta fallback com gemini-2.0-flash ou 1.5-pro
          if (geminiRes.status === 404 || geminiRes.status === 400) {
            const fallbackRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    { role: 'user', parts: [{ text: `${systemPrompt}\n\nUsuário: ${message}` }] }
                  ]
                })
              }
            );
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              const fbReply = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (fbReply) {
                return sendJson(200, {
                  success: true,
                  reply: fbReply.trim(),
                  provider: 'gemini',
                  model: 'gemini-2.0-flash'
                });
              }
            }
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
