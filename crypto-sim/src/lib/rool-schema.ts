/**
 * Rool schema setup for CryptoSim domain models
 */
import type { RoolChannel } from '@rool-dev/sdk';
import type { ReactiveChannel } from '@rool-dev/svelte';

export async function ensureSchema(channel: RoolChannel | ReactiveChannel) {
  const schema = channel.getSchema();
  if (schema.user) return; // Schema already set up

  await channel.createCollection('user', [
    { name: 'name', type: { kind: 'string' } },
    { name: 'cash_balance', type: { kind: 'number' } },
  ]);

  await channel.createCollection('position', [
    { name: 'userId', type: { kind: 'ref' } },
    { name: 'tokenSymbol', type: { kind: 'string' } },
    { name: 'amount', type: { kind: 'number' } },
    { name: 'avgEntryPrice', type: { kind: 'number' } },
  ]);

  await channel.createCollection('trade', [
    { name: 'userId', type: { kind: 'ref' } },
    { name: 'tokenSymbol', type: { kind: 'string' } },
    { name: 'side', type: { kind: 'enum', values: ['buy', 'sell'] } },
    { name: 'amount', type: { kind: 'number' } },
    { name: 'price', type: { kind: 'number' } },
    { name: 'timestamp', type: { kind: 'number' } },
  ]);

  await channel.createCollection('followedWallet', [
    { name: 'address', type: { kind: 'string' } },
    { name: 'userId', type: { kind: 'ref' } },
  ]);

  await channel.createCollection('whaleEvent', [
    { name: 'walletAddress', type: { kind: 'string' } },
    { name: 'tokenSymbol', type: { kind: 'string' } },
    { name: 'amount', type: { kind: 'number' } },
    { name: 'eventType', type: { kind: 'enum', values: ['buy', 'sell', 'transfer'] } },
    { name: 'timestamp', type: { kind: 'number' } },
    { name: 'signature', type: { kind: 'string' } },
  ]);

  await channel.createCollection('notification', [
    { name: 'userId', type: { kind: 'ref' } },
    { name: 'message', type: { kind: 'string' } },
    { name: 'read', type: { kind: 'boolean' } },
    { name: 'timestamp', type: { kind: 'number' } },
  ]);
}
