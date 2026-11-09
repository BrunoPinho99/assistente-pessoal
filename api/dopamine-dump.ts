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

// Minimal Mongoose Schema for Serverless Vercel
const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: 'parking' },
    isLocked: { type: Boolean, default: true },
    unlockConditions: { type: [String], default: [] },
    description: { type: String, default: '' },
    mainGoal: { type: String, default: '' },
    nextStep: { type: String, default: '' },
    area: { type: String, default: 'Littera' },
    stages: [
      {
        title: String,
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: any;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
};

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
    return sendJson(405, { success: false, error: 'Método não permitido. Use POST.' });
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
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const dataStr = Buffer.concat(buffers).toString();
        try {
          body = JSON.parse(dataStr || '{}');
        } catch {}
      }
    }

    const message = (body?.message || body?.idea || body?.text || '').trim();
    if (!message) {
      return sendJson(400, {
        success: false,
        error: 'Mensagem da ideia é obrigatória.'
      });
    }

    // Estruturação em tópicos
    const cleanName = message
      .replace(/^(tive uma ideia|tive ideia|ideia de|novo projeto|projeto de|criar um|criar uma|desenvolver um|desenvolver uma|fazer um|fazer uma)\s*(de\s+um|de\s+uma|sobre|de|do|da)?\s*/i, '')
      .trim();
    const firstWords = cleanName.split(' ').slice(0, 5).join(' ');
    const projectName = (firstWords.charAt(0).toUpperCase() + firstWords.slice(1)) || 'Nova Ideia';

    const structuredIdea = {
      name: projectName,
      hypothesis: `Validar se a solução para "${message.slice(0, 70)}" possui demanda e tração real sem comprometer as metas do Littera e Aura.`,
      scope: 'Escopo do MVP delimitado: protótipo conceitual com 3 funcionalidades essenciais.',
      topics: [
        `• Proposta de Valor: Resolver dor central relacionada a "${message.slice(0, 40)}..."`,
        '• Modelo de Entrega: Versão beta mínima (MVP) focada na funcionalidade central',
        '• Monetização / Viabilidade: Avaliar modelo de receita sem canibalizar empresas atuais',
        '• Bloqueio Protetivo: Ideia trancada com cadeado para blindar foco de Littera e Aura'
      ],
      next_step: 'Reavaliar no conselho trimestral após entrega da v1.8 do Littera em produção.'
    };

    const forcedUnlockConditions = [
      'Concluir entrega prioritária do Littera em produção',
      'Liberar 1 dos 2 slots de foco ativo (Regra da Substituição)'
    ];

    let persistedToMongo = false;
    let savedId = 'proj_' + Date.now();

    try {
      await connectToDatabase();
      const created = await Project.create({
        name: projectName,
        description: message, // Texto original da ideia
        category: 'parking',
        isLocked: true, // O isLocked: true é obrigatório
        createdAt: new Date(),
        unlockConditions: forcedUnlockConditions,
        mainGoal: structuredIdea.scope,
        nextStep: structuredIdea.next_step,
        area: 'Littera',
        stages: structuredIdea.topics.map(t => ({ title: t, completed: false }))
      });
      persistedToMongo = true;
      savedId = created._id ? created._id.toString() : savedId;
    } catch (dbErr: any) {
      console.warn('[Vercel Dopamine API] Erro ao persistir no Mongo:', dbErr.message);
    }

    return sendJson(200, {
      success: true,
      reply: '🔒 Ideia estruturada e trancada no arquivo morto. Foco mantido nos projetos ativos.',
      project: {
        id: savedId,
        name: projectName,
        category: 'parking',
        isLocked: true,
        createdAt: Date.now(),
        unlockConditions: forcedUnlockConditions,
        description: message,
        main_goal: structuredIdea.scope,
        next_step: structuredIdea.next_step,
        area: 'Littera',
        stages: structuredIdea.topics.map((t, idx) => ({
          id: `stage_dp_${Date.now()}_${idx}`,
          title: t,
          completed: false
        }))
      },
      structuredIdea,
      persistedToMongo
    });
  } catch (error: any) {
    console.error('[API /api/dopamine-dump Error]:', error);
    return sendJson(500, {
      success: false,
      error: error.message || 'Erro interno ao processar o estacionamento de dopamina.'
    });
  }
}
