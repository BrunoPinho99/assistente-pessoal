import mongoose from 'mongoose';
import { connectToDatabase as connectMongoServerless } from '../src/lib/mongodb';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Conecta ao MongoDB de forma resiliente e segura, reutilizando o cache Serverless
 * de src/lib/mongodb.ts.
 */
export async function connectToDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await connectMongoServerless();
    return conn.connection.readyState === 1;
  } catch (err: any) {
    console.warn(`[MongoDB Warning] Não foi possível conectar ao MongoDB: ${err.message}. Modo fallback ativado.`);
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
