import { connectToDatabase, isDbConnected } from '../db';
import { ProjectModel, IProject } from '../../src/models/Project';
import { structureIdeaWithLLM, StructuredIdeaOutput } from './llmStructurer';

export interface DopamineDumpResult {
  success: boolean;
  reply: string;
  project: {
    id: string;
    name: string;
    category: 'parking';
    isLocked: boolean;
    unlockConditions: string[];
    description: string;
    main_goal: string;
    next_step: string;
    area: string;
    stages: { id: string; title: string; completed: boolean }[];
  };
  structuredIdea: StructuredIdeaOutput;
  persistedToMongo: boolean;
}

/**
 * Motor do Estacionamento de Dopamina (Backend/API)
 * 1. Recebe a mensagem do usuário.
 * 2. Envia para o LLM pedindo para estruturar a ideia em tópicos.
 * 3. INTERCEPTA e FORÇA gravação no MongoDB com isLocked: true.
 * 4. Retorna a mensagem de proteção de foco para o front-end.
 */
export async function processDopamineDump(rawMessage: string): Promise<DopamineDumpResult> {
  if (!rawMessage || !rawMessage.trim()) {
    throw new Error('Mensagem da ideia é obrigatória.');
  }

  // Passo 1 & 2: Estruturar a ideia com LLM em tópicos
  const structured = await structureIdeaWithLLM(rawMessage);

  // Passo 3: INTERCEPTAÇÃO E ENFORCEMENT DE FOCO TDAH
  // O backend força isLocked: true e category: 'parking', independente do que a IA retorne!
  const forcedLocked = true;
  const forcedCategory = 'parking' as const;
  const forcedUnlockConditions = [
    'Concluir entrega prioritária do Littera em produção',
    'Liberar 1 dos 2 slots de foco ativo (Regra da Substituição)'
  ];

  const projectId = 'proj_' + Date.now();
  const stages = structured.topics.map((topic, index) => ({
    id: `stage_dp_${Date.now()}_${index}`,
    title: topic,
    completed: false
  }));

  let persistedToMongo = false;
  let mongoDocId = projectId;

  // Tenta persistir no MongoDB
  try {
    const connected = await connectToDatabase();
    if (connected) {
      const created = await ProjectModel.create({
        name: structured.name,
        category: forcedCategory,
        isLocked: forcedLocked, // FORÇADO PELO BACKEND
        unlockConditions: forcedUnlockConditions,
        description: structured.hypothesis,
        mainGoal: structured.scope,
        nextStep: structured.next_step,
        area: 'Littera',
        stages: stages.map(s => ({ title: s.title, completed: s.completed }))
      });
      persistedToMongo = true;
      mongoDocId = created._id ? created._id.toString() : projectId;
      console.log(`[DopamineDump] Projeto trancado gravado no MongoDB com sucesso: ${created.name} (isLocked: ${created.isLocked})`);
    }
  } catch (err: any) {
    console.warn(`[DopamineDump] Erro ao gravar no MongoDB, mantendo garantia de bloqueio em memória: ${err.message}`);
  }

  // Passo 4: Retorno exato exigido pelo TDAH Focus OS
  const replyMessage = 'Escopo estruturado e trancado no arquivo morto 🔒. Foco mantido no Littera.';

  return {
    success: true,
    reply: replyMessage,
    project: {
      id: mongoDocId,
      name: structured.name,
      category: forcedCategory,
      isLocked: forcedLocked,
      unlockConditions: forcedUnlockConditions,
      description: structured.hypothesis,
      main_goal: structured.scope,
      next_step: structured.next_step,
      area: 'Littera',
      stages
    },
    structuredIdea: structured,
    persistedToMongo
  };
}
