import mongoose from 'mongoose';

/**
 * Padrão de Cache Global de Conexão para Vercel Serverless & Node.js.
 *
 * Em ambientes Serverless (AWS Lambda / Vercel Functions), cada invocação pode
 * reaproveitar a instância do container Node.js. Sem o cache global, novas conexões
 * seriam abertas a cada request, esgotando o connection pool do MongoDB Atlas rapidamente (erros de Too Many Connections).
 */

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declaração de tipo para anexar ao objeto global do Node.js
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      'A variável de ambiente MONGODB_URI não foi definida. ' +
      'Por favor, adicione sua connection string do MongoDB Atlas no arquivo .env ou no painel da Vercel.'
    );
  }

  // Se já temos uma conexão ativa reaproveitada do container serverless
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // Se ainda não iniciamos a promise de conexão, iniciamos agora com pooling otimizado
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Em serverless, falhe imediatamente em vez de enfileirar comandos se a conexão cair
      maxPoolSize: 10,       // Mantém o pool leve por container serverless
      serverSelectionTimeoutMS: 5000, // Timeout de 5s para evitar cold-starts pendurados
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB Atlas] Conectado com sucesso ao banco: "${mongooseInstance.connection.name}"`);
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null; // Limpa promise em caso de erro para permitir retry na próxima requisição
      console.error('[MongoDB Atlas Error] Falha na conexão inicial:', err.message);
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

export default connectToDatabase;
