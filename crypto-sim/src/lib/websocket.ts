/**
 * WebSocket client for real-time updates from backend
 */
import { WS_URL } from './constants.js';

export type WSEvent = 'price:update' | 'whale:event' | 'notification:new' | 'portfolio:update';

export type WSHandler = (event: WSEvent, payload: unknown) => void;

let ws: WebSocket | null = null;
const handlers = new Set<WSHandler>();

function connect() {
  if (ws?.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(WS_URL);
  ws.onmessage = (e) => {
    try {
      const { event, payload } = JSON.parse(e.data);
      for (const h of handlers) h(event as WSEvent, payload);
    } catch { /* ignore */ }
  };
  ws.onclose = () => {
    ws = null;
    setTimeout(connect, 3000);
  };
}

export function subscribe(handler: WSHandler): () => void {
  handlers.add(handler);
  if (handlers.size === 1) connect();
  return () => {
    handlers.delete(handler);
  };
}
