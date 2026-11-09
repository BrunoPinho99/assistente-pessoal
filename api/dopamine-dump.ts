import type { IncomingMessage, ServerResponse } from 'http';
import { processDopamineDump } from '../server/services/dopamineService';
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
 * Endpoint Vercel Serverless: POST /api/dopamine-dump
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sendJson = (status: number, data: any) => {
    if (typeof res.status === 'function') {
      res.status(status).json(data);
    } else {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }
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

    // Se o body ainda for uma stream não parseada
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

    const message = body?.message || body?.idea || body?.text;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendJson(400, {
        success: false,
        error: 'Mensagem da ideia é obrigatória.'
      });
    }

    const result = await processDopamineDump(message);
    return sendJson(200, result);
  } catch (error: any) {
    console.error('[API /api/dopamine-dump Error]:', error);
    return sendJson(500, {
      success: false,
      error: error.message || 'Erro interno ao processar o estacionamento de dopamina.'
    });
  }
}
