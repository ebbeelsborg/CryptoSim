/**
 * Price Service - Fetches crypto prices from CoinGecko API
 * Polls every 15 seconds, caches latest prices in memory
 */

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const SUPPORTED_SYMBOLS = ['sol', 'btc', 'eth', 'usdc', 'bonk', 'wif', 'jup', 'ray'];

export interface TokenPrice {
  symbol: string;
  priceUsd: number;
  timestamp: number;
}

const priceCache = new Map<string, TokenPrice>();

export async function fetchPrices(): Promise<TokenPrice[]> {
  const ids = SUPPORTED_SYMBOLS.join(',');
  const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data = (await res.json()) as Record<string, { usd: number }>;
  const timestamp = Date.now();
  const prices: TokenPrice[] = [];

  for (const symbol of SUPPORTED_SYMBOLS) {
    const price = data[symbol]?.usd;
    if (typeof price === 'number') {
      const tokenPrice: TokenPrice = { symbol, priceUsd: price, timestamp };
      prices.push(tokenPrice);
      priceCache.set(symbol, tokenPrice);
    }
  }

  return prices;
}

export function getCachedPrice(symbol: string): TokenPrice | undefined {
  return priceCache.get(symbol.toLowerCase());
}

export function getCachedPrices(): TokenPrice[] {
  return Array.from(priceCache.values());
}
