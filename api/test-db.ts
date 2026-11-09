import type { IncomingMessage, ServerResponse } from 'http';
import { connectToDatabase } from '../src/lib/mongodb';
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
 * Handler de Teste de Conexão Serverless (Vercel & Local)
 * Endpoint: GET /api/test-db
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  // Helper para padronizar responses se executado em ambientes sem helpers Express/Vercel
  const sendJson = (status: number, data: any) => {
    if (typeof res.status === 'function') {
      res.status(status).json(data);
    } else {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }
  };

  try {
    // 1. Tenta conectar ou reaproveitar a conexão cached
    const mongooseInstance = await connectToDatabase();
    const conn = mongooseInstance.connection;

    // 2. Executa um ping administrativo rápido no MongoDB Atlas
    let pingResult: any = null;
    if (conn.db) {
      pingResult = await conn.db.admin().ping();
    }

    const latencyMs = Date.now() - startTime;

    return sendJson(200, {
      status: 'success',
      message: 'Conexão com o MongoDB Atlas estabelecida com sucesso no ambiente Serverless!',
      database: conn.name,
      host: conn.host,
      readyState: conn.readyState, // 1 = connected
      ping: pingResult?.ok === 1 ? 'PONG (ok)' : pingResult,
      latencyMs: `${latencyMs}ms`,
      serverlessCached: global.mongooseCache?.conn !== null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('[API /api/test-db Error]:', error);

    const isMissingUri = !process.env.MONGODB_URI;
    const isIpWhitelistError = error.message?.includes('whitelist') || error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED');
    const isAuthError = error.message?.includes('bad auth') || error.message?.includes('Authentication failed');

    let troubleshootingTip = 'Verifique se a connection string do MongoDB Atlas está correta.';
    if (isMissingUri) {
      troubleshootingTip = 'Defina a variável MONGODB_URI no arquivo .env (local) e nas Environment Variables da Vercel.';
    } else if (isIpWhitelistError) {
      troubleshootingTip = 'No MongoDB Atlas, acesse "Network Access" e adicione 0.0.0.0/0 (Allow access from anywhere) para permitir conexões da Vercel.';
    } else if (isAuthError) {
      troubleshootingTip = 'Usuário ou senha incorretos na string do Atlas. Lembre-se de substituir <db_password> pela senha real do usuário do banco.';
    }

    return sendJson(500, {
      status: 'error',
      message: 'Falha ao conectar com o MongoDB Atlas.',
      error: error.message || 'Erro desconhecido',
      troubleshootingTip,
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString()
    });
  }
}
