// Use relative URLs when proxied (dev), or env for production
export const API_URL = import.meta.env.VITE_API_URL ?? '';
export const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`;

export const INITIAL_CASH = 1_000_000;
