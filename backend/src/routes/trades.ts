import { Router } from 'express';
import { getCachedPrice } from '../services/priceService.js';

/**
 * Trade routes - provide price data for client-side trading.
 * Actual trade execution happens client-side (Rool updates).
 */
export const tradeRoutes = Router();

tradeRoutes.get('/price/:symbol', (req, res) => {
  const { symbol } = req.params;
  const price = getCachedPrice(symbol);
  if (!price) {
    return res.status(404).json({ error: `No price for ${symbol}` });
  }
  res.json(price);
});
