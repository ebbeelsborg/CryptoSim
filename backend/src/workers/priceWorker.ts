/**
 * Price Worker - Polls CoinGecko every 15 seconds, broadcasts via WebSocket
 */

import { fetchPrices } from '../services/priceService.js';
import { broadcast } from '../realtime.js';

const INTERVAL_MS = 15_000;

export function startPriceWorker() {
  async function poll() {
    try {
      const prices = await fetchPrices();
      broadcast('price:update', { prices });
    } catch (err) {
      console.error('[PriceWorker]', err);
    }
  }

  poll();
  setInterval(poll, INTERVAL_MS);
}
