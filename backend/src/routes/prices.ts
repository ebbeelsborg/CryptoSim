import { Router } from 'express';
import { fetchPrices, getCachedPrices } from '../services/priceService.js';

export const priceRoutes = Router();

priceRoutes.get('/', async (_req, res) => {
  try {
    const cached = getCachedPrices();
    if (cached.length > 0) {
      return res.json({ prices: cached });
    }
    const prices = await fetchPrices();
    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

priceRoutes.get('/refresh', async (_req, res) => {
  try {
    const prices = await fetchPrices();
    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
