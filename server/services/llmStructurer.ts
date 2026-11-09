/**
 * Serviço de Estruturação com LLM
 * Envia a mensagem para o LLM pedindo apenas para estruturar a ideia em tópicos.
 * Suporta Gemini API, OpenAI ou fallback heurístico inteligente sem dependência externa.
 */

export interface StructuredIdeaOutput {
  name: string;
  hypothesis: string;
  scope: string;
  topics: string[];
  next_step: string;
}

export async function structureIdeaWithLLM(userIdea: string): Promise<StructuredIdeaOutput> {
  const cleaned = userIdea.trim();

  // 1. Tentar chamar Gemini API se chave estiver presente
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Você é um copiloto executivo para pessoas com TDAH. O usuário teve uma ideia impulsiva e precisa descarregá-la para não perder o foco nos negócios ativos.
Estruture a seguinte ideia APENAS em tópicos objetivos em formato JSON com os campos:
{
  "name": "Nome conciso e marcante do projeto (máx 5 palavras)",
  "hypothesis": "Hipótese de valor central em 1 frase",
  "scope": "Escopo inicial do MVP em tópicos resumidos",
  "topics": ["Tópico 1: Proposta de valor", "Tópico 2: Público-alvo", "Tópico 3: Funcionalidades essenciais do MVP", "Tópico 4: Riscos e dependências"],
  "next_step": "Ação recomendada para quando houver slot de foco liberado"
}

Ideia do usuário: "${cleaned}"`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          return {
            name: parsed.name || extractFallbackName(cleaned),
            hypothesis: parsed.hypothesis || `Hipótese: ${cleaned}`,
            scope: parsed.scope || 'MVP inicial com foco em validação rápida.',
            topics: Array.isArray(parsed.topics) && parsed.topics.length > 0 ? parsed.topics : defaultTopics(cleaned),
            next_step: parsed.next_step || 'Revisar apenas após concluir releases ativas do Littera.'
          };
        }
      }
    } catch (err: any) {
      console.warn('[LLM Structurer] Erro ao consultar Gemini API, acionando fallback local:', err.message);
    }
  }

  // 2. Fallback Heurístico Estruturado (Rápido, Confiável e Offline-Ready)
  return generateLocalStructure(cleaned);
}

function extractFallbackName(text: string): string {
  const clean = text
    .replace(/^(tive uma ideia|tive ideia|ideia de|novo projeto|projeto de|criar um|criar uma|desenvolver um|desenvolver uma|fazer um|fazer uma)\s*(de\s+um|de\s+uma|sobre|de|do|da)?\s*/i, '')
    .trim();
  const firstWords = clean.split(' ').slice(0, 5).join(' ');
  const capitalized = firstWords.charAt(0).toUpperCase() + firstWords.slice(1);
  return capitalized.length > 3 ? capitalized : 'Nova Ideia de Negócio';
}

function defaultTopics(text: string): string[] {
  return [
    `• Proposta de Valor: Resolver dor central relacionada a "${text.slice(0, 40)}..."`,
    '• Modelo de Entrega: Versão beta mínima (MVP) focada na funcionalidade central',
    '• Monetização / Viabilidade: Avaliar modelo de receita sem canibalizar empresas atuais',
    '• Bloqueio Protetivo: Ideia trancada com cadeado para blindar foco de Littera e Aura'
  ];
}

function generateLocalStructure(rawText: string): StructuredIdeaOutput {
  const name = extractFallbackName(rawText);
  return {
    name,
    hypothesis: `Validar se a solução para "${rawText.slice(0, 70)}" possui demanda e tração real sem comprometer as metas do Littera e Aura.`,
    scope: `Escopo do MVP delimitado: protótipo conceitual ou landing page de validação com 3 funcionalidades essenciais.`,
    topics: defaultTopics(rawText),
    next_step: `Reavaliar no conselho trimestral após entrega da v1.8 do Littera em produção.`
  };
}
