import express from 'express';
import dotenv from 'dotenv';
import { dopamineDumpRouter } from './routes/dopamineDumpRouter';
import { connectToDatabase } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS permissivo para dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rotas do TDAH Focus OS
app.use('/api/dopamine-dump', dopamineDumpRouter);

// Rota de Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TDAH Focus OS - Dopamine Parking Engine',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`[TDAH Focus OS Backend] Servidor rodando na porta ${PORT}`);
    console.log(`[Endpoint] POST http://localhost:${PORT}/api/dopamine-dump`);
  });
}

startServer();

export default app;
