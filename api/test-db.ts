import type { IncomingMessage, ServerResponse } from 'http';
import mongoose from 'mongoose';
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
    throw new Error(
      'A variável de ambiente MONGODB_URI não foi definida no ambiente da Vercel. ' +
      'Por favor, adicione MONGODB_URI nas Environment Variables da Vercel.'
    );
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
 * Handler Serverless Vercel: GET /api/test-db
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(data));
  };

  try {
    const mongooseInstance = await connectToDatabase();
    const conn = mongooseInstance.connection;

    let pingResult: any = null;
    if (conn.db) {
      pingResult = await conn.db.admin().ping();
    }

    const latencyMs = Date.now() - startTime;

    return sendJson(200, {
      status: 'success',
      message: 'Conexão com o MongoDB Atlas estabelecida com sucesso no ambiente Serverless da Vercel!',
      database: conn.name,
      host: conn.host,
      readyState: conn.readyState,
      ping: pingResult?.ok === 1 ? 'PONG (ok)' : pingResult,
      latencyMs: `${latencyMs}ms`,
      serverlessCached: global.mongooseCache?.conn !== null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('[API /api/test-db Error]:', error);

    return sendJson(500, {
      status: 'error',
      message: 'Falha ao conectar com o MongoDB Atlas na Vercel.',
      error: error.message || 'Erro desconhecido',
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString()
    });
  }
}
