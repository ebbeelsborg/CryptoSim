/**
 * Price store - fetches from API, updates from WebSocket
 */
import { fetchPrices } from './api.js';
import { subscribe } from './websocket.js';

async function fetchFromApi() {
  try {
    return await fetchPrices();
  } catch {
    return [];
  }
}

export function createPriceStore() {
  let prices = $state<Record<string, number>>({});

  async function load() {
    const list = await fetchFromApi();
    const next: Record<string, number> = {};
    for (const p of list) next[p.symbol] = p.priceUsd;
    prices = next;
  }

  const unsub = subscribe((event, payload) => {
    if (event !== 'price:update') return;
    const { prices: list } = payload as { prices: Array<{ symbol: string; priceUsd: number }> };
    const next: Record<string, number> = {};
    for (const p of list ?? []) next[p.symbol] = p.priceUsd;
    prices = next;
  });

  return {
    get prices() {
      return prices;
    },
    load,
    destroy: unsub,
  };
}
