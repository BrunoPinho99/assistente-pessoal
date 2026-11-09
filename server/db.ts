import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_os';

let isConnected = false;

/**
 * Conecta ao MongoDB de forma resiliente e segura.
 * Se o MongoDB local ou Atlas estiver indisponível, não quebra a aplicação,
 * permitindo fallback em memória com aviso claro.
 */
export async function connectToDatabase(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500, // Timeout rápido para não travar a requisição do usuário
      socketTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[MongoDB] Conectado com sucesso a: ${conn.connection.name}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Não foi possível conectar a ${MONGODB_URI}: ${err.message}. Modo fallback ativado.`);
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

