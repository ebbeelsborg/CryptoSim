import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './realtime.js';
import { priceRoutes } from './routes/prices.js';
import { solanaRoutes } from './routes/solana.js';
import { tradeRoutes } from './routes/trades.js';
import { startPriceWorker } from './workers/priceWorker.js';
import { startWhaleWorker } from './workers/whaleWorker.js';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/prices', priceRoutes);
app.use('/api/solana', solanaRoutes);
app.use('/api/trades', tradeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// WebSocket for real-time updates
setupWebSocket(server);

const PORT = process.env.PORT ?? 3001;

server.listen(PORT, () => {
  console.log(`CryptoSim backend running on http://localhost:${PORT}`);
  startPriceWorker();
  startWhaleWorker();
});
