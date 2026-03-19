/**
 * WebSocket server for real-time updates
 * Emits: portfolio:update, whale:event, notification:new, price:update
 */

import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'http';

const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });
}

export function broadcast(event: string, payload: unknown) {
  const msg = JSON.stringify({ event, payload });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}
