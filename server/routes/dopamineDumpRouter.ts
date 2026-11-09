import { Router, Request, Response } from 'express';
import { processDopamineDump } from '../services/dopamineService';

export const dopamineDumpRouter = Router();

/**
 * POST /api/dopamine-dump
 * Recebe a ideia de negócio do front-end, estrutura em tópicos via LLM,
 * intercepta e força isLocked: true no MongoDB, e retorna a mensagem de proteção de foco.
 */
dopamineDumpRouter.post('/', async (req: Request, res: Response) => {
  try {
    const rawMessage = req.body?.message || req.body?.idea || req.body?.text;

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem da ideia é obrigatória no corpo da requisição.'
      });
    }

    const result = await processDopamineDump(rawMessage);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[dopamineDumpRouter] Erro ao processar:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar o estacionamento de dopamina.'
    });
  }
});

