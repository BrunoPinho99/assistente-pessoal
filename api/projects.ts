import type { IncomingMessage, ServerResponse } from 'http';
import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('A variável de ambiente MONGODB_URI não foi definida.');
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((instance) => {
      return instance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Project Schema for MongoDB Atlas
const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    area: { type: String, default: 'Littera' },
    category: { type: String, default: 'profissional' },
    main_goal: { type: String, default: '' },
    next_step: { type: String, default: '' },
    status: { type: String, default: 'ativo' },
    slot: { type: String, enum: ['ancora', 'satelite', 'valvula', null], default: null },
    locked: { type: Boolean, default: false },
    unlockConditions: { type: [String], default: [] },
    stages: [
      {
        id: { type: String, default: () => 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    documents: [
      {
        id: String,
        title: String,
        url: String
      }
    ],
    decision_history: [
      {
        id: String,
        date: String,
        decision: String,
        context: String
      }
    ]
  },
  { timestamps: true }
);

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: any;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
};

// Seed inicial caso o MongoDB esteja vazio
const DEFAULT_SEED_PROJECTS = [
  {
    id: 'proj_littera',
    title: 'Littera EdTech Engine',
    area: 'Littera',
    category: 'profissional',
    main_goal: 'Lançar MVP de recomendação de leitura adaptativa com IA',
    status: 'ativo',
    slot: 'ancora',
    locked: false,
    next_step: 'Finalizar testes de integração do pipeline de analytics',
    stages: [
      { id: 'st_l1', title: 'Arquitetura do pipeline de leitura', completed: true },
      { id: 'st_l2', title: 'Integração de recomendação adaptativa', completed: true },
      { id: 'st_l3', title: 'Testes de carga e deploy de produção', completed: false }
    ],
    documents: [],
    decision_history: [
      { id: 'dh_1', date: '2026-11-01', decision: 'Priorizar estabilidade da API antes de novas features' }
    ]
  },
  {
    id: 'proj_aura',
    title: 'Aura Studio Digital',
    area: 'Aura',
    category: 'profissional',
    main_goal: 'Estruturar esteira de entregas de design system e branding tech',
    status: 'ativo',
    slot: 'satelite',
    locked: false,
    next_step: 'Revisar protótipo de alta fidelidade do dashboard v2',
    stages: [
      { id: 'st_a1', title: 'Refatoração da identidade visual', completed: true },
      { id: 'st_a2', title: 'Design System de alta conversão', completed: false },
      { id: 'st_a3', title: 'Captação ativa dos primeiros 3 clientes enterprise', completed: false }
    ],
    documents: [],
    decision_history: []
  },
  {
    id: 'proj_idp',
    title: 'IDP Tech & Inovação',
    area: 'IDP',
    category: 'academico',
    main_goal: 'Concluir módulo de pesquisa aplicada e laboratório de IA',
    status: 'pausado',
    slot: null,
    locked: true,
    unlockConditions: [
      'Entregar milestone crítico do Littera',
      'Liberar 1 dos 3 slots de banda (Regra de Substituição)'
    ],
    next_step: 'Reavaliar no ciclo trimestral de estudos',
    stages: [
      { id: 'st_idp1', title: 'Submissão de artigo de pesquisa', completed: true },
      { id: 'st_idp2', title: 'Implementação de prova de conceito', completed: false }
    ],
    documents: [],
    decision_history: []
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    return sendJson(200, { ok: true });
  }

  try {
    await connectToDatabase();

    const url = new URL(req.url || '', 'http://localhost');
    const queryId = (url.searchParams.get('id') || (req.query?.id as string) || '').trim();

    // Helper para ler body de forma segura
    const parseBody = async () => {
      if (req.body && typeof req.body === 'object') return req.body;
      if (typeof req.body === 'string' && req.body.trim()) {
        try { return JSON.parse(req.body); } catch { return {}; }
      }
      try {
        if (typeof (req as any)[Symbol.asyncIterator] === 'function') {
          const buffers: any[] = [];
          for await (const chunk of req) buffers.push(chunk);
          if (buffers.length > 0) {
            return JSON.parse(Buffer.concat(buffers).toString() || '{}');
          }
        }
      } catch {
        return {};
      }
      return {};
    };

    // --------------------------------------------------------------------------
    // 1. GET: Listar todos os projetos (Read)
    // --------------------------------------------------------------------------
    if (req.method === 'GET') {
      let docs = await ProjectModel.find({}).sort({ updatedAt: -1, createdAt: -1 }).lean();

      // Se a coleção estiver vazia, faz o seed inicial dos projetos padrão
      if (!docs || docs.length === 0) {
        await ProjectModel.insertMany(DEFAULT_SEED_PROJECTS);
        docs = await ProjectModel.find({}).sort({ updatedAt: -1, createdAt: -1 }).lean();
      }

      // Normaliza campos para compatibilidade com o frontend e Protocolo 1-1-1
      const activeSlotsAssigned = new Set<string>();
      const normalizedProjects = docs.map((doc: any) => {
        const isLocked = doc.locked !== undefined ? Boolean(doc.locked) : Boolean(doc.isLocked);
        let slot = doc.slot || null;

        if (!isLocked) {
          if (!slot || activeSlotsAssigned.has(slot)) {
            const freeSlot = (['ancora', 'satelite', 'valvula'] as const).find(s => !activeSlotsAssigned.has(s)) || 'valvula';
            slot = freeSlot;
          }
          activeSlotsAssigned.add(slot);
        } else {
          slot = null;
        }

        return {
          id: doc.id || String(doc._id),
          title: doc.title || doc.name || 'Sem título',
          description: doc.description || '',
          area: doc.area || 'Littera',
          category: doc.category || 'profissional',
          main_goal: doc.main_goal || doc.mainGoal || '',
          next_step: doc.next_step || doc.nextStep || '',
          status: doc.status || 'ativo',
          slot,
          locked: isLocked,
          unlockConditions: doc.unlockConditions || [],
          stages: Array.isArray(doc.stages) ? doc.stages.map((st: any) => ({
            id: st.id || String(st._id),
            title: st.title,
            completed: Boolean(st.completed)
          })) : [],
          documents: doc.documents || [],
          decision_history: doc.decision_history || [],
          created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
        };
      });

      return sendJson(200, {
        success: true,
        count: normalizedProjects.length,
        projects: normalizedProjects
      });
    }

    // --------------------------------------------------------------------------
    // 2. POST: Criar novo projeto (Create)
    // --------------------------------------------------------------------------
    if (req.method === 'POST') {
      const body = await parseBody();
      const title = (body.title || body.name || '').trim();

      if (!title) {
        return sendJson(400, { error: 'O título do projeto é obrigatório.' });
      }

      const projectId = body.id || 'proj_' + Date.now();
      const newDoc = {
        id: projectId,
        title,
        description: body.description || '',
        area: body.area || 'Littera',
        category: body.category || 'profissional',
        main_goal: body.main_goal || body.mainGoal || 'Entregar objetivos estratégicos',
        next_step: body.next_step || body.nextStep || 'Definir primeiro passo',
        status: body.status || 'ativo',
        slot: body.slot || null,
        locked: body.locked !== undefined ? Boolean(body.locked) : Boolean(body.isLocked),
        unlockConditions: body.unlockConditions || [],
        stages: Array.isArray(body.stages) && body.stages.length > 0 
          ? body.stages.map((st: any) => ({
              id: st.id || 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              title: st.title,
              completed: Boolean(st.completed)
            }))
          : [
              { id: 'st_' + Date.now() + '_1', title: 'Planejamento e alinhamento', completed: true },
              { id: 'st_' + Date.now() + '_2', title: 'Execução do primeiro bloco', completed: false }
            ],
        documents: body.documents || [],
        decision_history: body.decision_history || [
          { id: 'dh_' + Date.now(), date: new Date().toISOString().slice(0, 10), decision: 'Projeto iniciado no Personal OS' }
        ]
      };

      const created = await ProjectModel.create(newDoc);

      return sendJson(201, {
        success: true,
        message: 'Projeto criado e salvo no MongoDB Atlas com sucesso.',
        project: {
          ...newDoc,
          _id: created._id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // --------------------------------------------------------------------------
    // 3. PUT / PATCH: Atualizar projeto existente (Update)
    // --------------------------------------------------------------------------
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await parseBody();
      const targetId = queryId || body.id || body._id;

      if (!targetId) {
        return sendJson(400, { error: 'ID do projeto é obrigatório para atualização.' });
      }

      const updates: any = {};
      if (body.title !== undefined) updates.title = body.title;
      if (body.name !== undefined && body.title === undefined) updates.title = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.area !== undefined) updates.area = body.area;
      if (body.category !== undefined) updates.category = body.category;
      if (body.main_goal !== undefined) updates.main_goal = body.main_goal;
      if (body.mainGoal !== undefined && body.main_goal === undefined) updates.main_goal = body.mainGoal;
      if (body.next_step !== undefined) updates.next_step = body.next_step;
      if (body.nextStep !== undefined && body.next_step === undefined) updates.next_step = body.nextStep;
      if (body.status !== undefined) updates.status = body.status;
      if (body.slot !== undefined) updates.slot = body.slot;
      if (body.locked !== undefined) updates.locked = Boolean(body.locked);
      if (body.isLocked !== undefined && body.locked === undefined) updates.locked = Boolean(body.isLocked);
      if (body.unlockConditions !== undefined) updates.unlockConditions = body.unlockConditions;
      if (body.stages !== undefined) updates.stages = body.stages;
      if (body.documents !== undefined) updates.documents = body.documents;
      if (body.decision_history !== undefined) updates.decision_history = body.decision_history;

      const updated = await ProjectModel.findOneAndUpdate(
        { $or: [{ id: targetId }, { _id: mongoose.isValidObjectId(targetId) ? targetId : undefined }] },
        { $set: updates },
        { returnDocument: 'after', lean: true }
      );

      if (!updated) {
        return sendJson(404, { error: 'Projeto não encontrado no banco de dados.' });
      }

      return sendJson(200, {
        success: true,
        message: 'Projeto atualizado com sucesso no MongoDB Atlas.',
        project: {
          id: updated.id || String(updated._id),
          title: updated.title || updated.name,
          description: updated.description,
          area: updated.area,
          category: updated.category,
          main_goal: updated.main_goal || updated.mainGoal,
          next_step: updated.next_step || updated.nextStep,
          status: updated.status,
          slot: updated.slot || null,
          locked: updated.locked !== undefined ? Boolean(updated.locked) : Boolean(updated.isLocked),
          unlockConditions: updated.unlockConditions || [],
          stages: updated.stages || [],
          documents: updated.documents || [],
          decision_history: updated.decision_history || [],
          updated_at: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString()
        }
      });
    }

    // --------------------------------------------------------------------------
    // 4. DELETE: Excluir projeto (Delete)
    // --------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const body = await parseBody();
      const targetId = queryId || body.id || body._id;

      if (!targetId) {
        return sendJson(400, { error: 'ID do projeto é obrigatório para exclusão.' });
      }

      const deleted = await ProjectModel.findOneAndDelete({
        $or: [{ id: targetId }, { _id: mongoose.isValidObjectId(targetId) ? targetId : undefined }]
      });

      if (!deleted) {
        return sendJson(404, { error: 'Projeto não encontrado para exclusão.' });
      }

      return sendJson(200, {
        success: true,
        message: 'Projeto removido com sucesso do MongoDB Atlas.',
        deletedId: targetId
      });
    }

    return sendJson(405, { error: 'Método não permitido.' });
  } catch (err: any) {
    console.error('[API /api/projects Error]:', err);
    return sendJson(500, {
      error: 'Erro interno ao processar operação nos projetos.',
      details: err.message
    });
  }
}
