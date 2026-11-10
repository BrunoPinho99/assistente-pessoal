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

// Task Schema for MongoDB Atlas
const TaskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    area: { type: String, default: 'Littera' },
    category: { type: String, default: 'profissional' },
    project_id: { type: String, default: null },
    subject_id: { type: String, default: null },
    deadline: { type: String, default: null },
    priority: { type: String, default: 'media' },
    estimated_minutes: { type: Number, default: 25 },
    difficulty: { type: String, default: 'medio' },
    energy_level: { type: String, default: 'medium' },
    status: { type: String, default: 'a_fazer' },
    subtasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    notes: { type: String, default: '' },
    recurrence: { type: String, default: 'nenhuma' },
    context_resume: { type: Schema.Types.Mixed, default: null },
    completed_at: { type: String, default: null }
  },
  { timestamps: true }
);

const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: any;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
};

// Seed inicial de tarefas para persistência contínua
const DEFAULT_SEED_TASKS = [
  {
    id: 'task_prioridades_empresas',
    title: 'Definir as 3 prioridades essenciais de hoje',
    area: 'Littera',
    description: 'Escrever no topo do dia para não se perder em tarefas secundárias.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'urgente',
    estimated_minutes: 45,
    difficulty: 'medio',
    energy_level: 'high',
    status: 'em_andamento',
    deadline: 'Hoje, até 10h',
    subtasks: [
      { id: 'sub_pe1', title: 'Mapear entregas críticas do Littera', completed: true },
      { id: 'sub_pe2', title: 'Alinhar blockers com Tales (Pinho Media)', completed: false }
    ],
    notes: 'Manter foco exclusivo na esteira das duas empresas ativas.',
    created_at: new Date().toISOString()
  },
  {
    id: 'task_littera_landing',
    title: 'Finalizar landing page do Littera',
    area: 'Littera',
    description: 'Ajustar copy de conversão e formulário de lista de espera.',
    category: 'profissional',
    project_id: 'proj_littera',
    priority: 'alta',
    estimated_minutes: 45,
    difficulty: 'medio',
    energy_level: 'medium',
    status: 'a_fazer',
    deadline: 'Hoje, 15h',
    subtasks: [
      { id: 'sub_ll1', title: 'Revisar hero section no Figma', completed: true },
      { id: 'sub_ll2', title: 'Conectar envio do form ao banco', completed: false }
    ],
    notes: 'Prioridade alta para validação do produto.',
    created_at: new Date().toISOString()
  },
  {
    id: 'task_aura_reuniao_tales',
    title: 'Reunião com Tales – Pinho Media',
    area: 'Aura',
    description: 'Alinhamento estratégico do trimestre e novos entregáveis.',
    category: 'profissional',
    project_id: 'proj_aura',
    priority: 'alta',
    estimated_minutes: 30,
    difficulty: 'facil',
    energy_level: 'medium',
    status: 'a_fazer',
    deadline: 'Hoje, 17h',
    subtasks: [
      { id: 'sub_art1', title: 'Pauta com tópicos de sprint', completed: true },
      { id: 'sub_art2', title: 'Definir metas de entrega de novembro', completed: false }
    ],
    notes: 'Trazer métricas consolidadas.',
    created_at: new Date().toISOString()
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
    // 1. GET: Listar todas as tarefas (Read)
    // --------------------------------------------------------------------------
    if (req.method === 'GET') {
      let docs = await TaskModel.find({}).sort({ createdAt: -1 }).lean();

      // Se vazio, seed inicial
      if (!docs || docs.length === 0) {
        await TaskModel.insertMany(DEFAULT_SEED_TASKS);
        docs = await TaskModel.find({}).sort({ createdAt: -1 }).lean();
      }

      const normalizedTasks = docs.map((doc: any) => ({
        id: doc.id || String(doc._id),
        title: doc.title,
        description: doc.description || '',
        area: doc.area || 'Littera',
        category: doc.category || 'profissional',
        project_id: doc.project_id || null,
        subject_id: doc.subject_id || null,
        deadline: doc.deadline || null,
        priority: doc.priority || 'media',
        estimated_minutes: doc.estimated_minutes ?? 25,
        difficulty: doc.difficulty || 'medio',
        energy_level: doc.energy_level || 'medium',
        status: doc.status || 'a_fazer',
        subtasks: Array.isArray(doc.subtasks) ? doc.subtasks.map((st: any) => ({
          id: st.id || String(st._id),
          title: st.title,
          completed: Boolean(st.completed)
        })) : [],
        notes: doc.notes || '',
        recurrence: doc.recurrence || 'nenhuma',
        context_resume: doc.context_resume || null,
        completed_at: doc.completed_at || null,
        created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()
      }));

      return sendJson(200, {
        success: true,
        count: normalizedTasks.length,
        tasks: normalizedTasks
      });
    }

    // --------------------------------------------------------------------------
    // 2. POST: Criar nova tarefa (Create)
    // --------------------------------------------------------------------------
    if (req.method === 'POST') {
      const body = await parseBody();
      const title = (body.title || '').trim();

      if (!title) {
        return sendJson(400, { error: 'O título da tarefa é obrigatório.' });
      }

      const taskId = body.id || 'task_' + Date.now();
      const newDoc = {
        id: taskId,
        title,
        description: body.description || '',
        area: body.area || 'Littera',
        category: body.category || 'profissional',
        project_id: body.project_id || null,
        subject_id: body.subject_id || null,
        deadline: body.deadline || null,
        priority: body.priority || 'media',
        estimated_minutes: Number(body.estimated_minutes) || 25,
        difficulty: body.difficulty || 'medio',
        energy_level: body.energy_level || 'medium',
        status: body.status || 'a_fazer',
        subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
        notes: body.notes || '',
        recurrence: body.recurrence || 'nenhuma',
        context_resume: body.context_resume || null,
        completed_at: body.completed_at || null
      };

      const created = await TaskModel.create(newDoc);

      return sendJson(201, {
        success: true,
        message: 'Tarefa criada e salva no MongoDB Atlas com sucesso.',
        task: {
          ...newDoc,
          _id: created._id,
          created_at: new Date().toISOString()
        }
      });
    }

    // --------------------------------------------------------------------------
    // 3. PUT / PATCH: Atualizar tarefa existente (Update)
    // --------------------------------------------------------------------------
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await parseBody();
      const targetId = queryId || body.id || body._id;

      if (!targetId) {
        return sendJson(400, { error: 'ID da tarefa é obrigatório para atualização.' });
      }

      const updates: any = {};
      if (body.title !== undefined) updates.title = body.title;
      if (body.description !== undefined) updates.description = body.description;
      if (body.area !== undefined) updates.area = body.area;
      if (body.category !== undefined) updates.category = body.category;
      if (body.project_id !== undefined) updates.project_id = body.project_id;
      if (body.subject_id !== undefined) updates.subject_id = body.subject_id;
      if (body.deadline !== undefined) updates.deadline = body.deadline;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.estimated_minutes !== undefined) updates.estimated_minutes = Number(body.estimated_minutes);
      if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
      if (body.energy_level !== undefined) updates.energy_level = body.energy_level;
      if (body.status !== undefined) updates.status = body.status;
      if (body.subtasks !== undefined) updates.subtasks = body.subtasks;
      if (body.notes !== undefined) updates.notes = body.notes;
      if (body.recurrence !== undefined) updates.recurrence = body.recurrence;
      if (body.context_resume !== undefined) updates.context_resume = body.context_resume;
      if (body.completed_at !== undefined) updates.completed_at = body.completed_at;

      const updated = await TaskModel.findOneAndUpdate(
        { $or: [{ id: targetId }, { _id: mongoose.isValidObjectId(targetId) ? targetId : undefined }] },
        { $set: updates },
        { returnDocument: 'after', lean: true }
      );

      if (!updated) {
        return sendJson(404, { error: 'Tarefa não encontrada no banco de dados.' });
      }

      return sendJson(200, {
        success: true,
        message: 'Tarefa atualizada com sucesso no MongoDB Atlas.',
        task: updated
      });
    }

    // --------------------------------------------------------------------------
    // 4. DELETE: Excluir tarefa (Delete)
    // --------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const body = await parseBody();
      const targetId = queryId || body.id || body._id;

      if (!targetId) {
        return sendJson(400, { error: 'ID da tarefa é obrigatório para exclusão.' });
      }

      const deleted = await TaskModel.findOneAndDelete({
        $or: [{ id: targetId }, { _id: mongoose.isValidObjectId(targetId) ? targetId : undefined }]
      });

      if (!deleted) {
        return sendJson(404, { error: 'Tarefa não encontrada para exclusão.' });
      }

      return sendJson(200, {
        success: true,
        message: 'Tarefa excluída do MongoDB Atlas com sucesso.'
      });
    }

    return sendJson(405, { error: 'Método HTTP não suportado.' });
  } catch (err: any) {
    console.error('Erro na rota /api/tasks:', err);
    return sendJson(500, {
      success: false,
      error: 'Erro no servidor do MongoDB Atlas.',
      message: err.message
    });
  }
}

