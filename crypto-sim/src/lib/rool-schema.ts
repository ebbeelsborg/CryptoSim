/**
 * Rool schema setup for CryptoSim domain models
 */
import type { RoolChannel } from '@rool-dev/sdk';
import type { ReactiveChannel } from '@rool-dev/svelte';

const USER_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'user' } },
  { name: 'name', type: { kind: 'string' as const } },
  { name: 'cash_balance', type: { kind: 'number' as const } },
];

const POSITION_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'position' } },
  { name: 'userId', type: { kind: 'ref' as const } },
  { name: 'tokenSymbol', type: { kind: 'string' as const } },
  { name: 'amount', type: { kind: 'number' as const } },
  { name: 'avgEntryPrice', type: { kind: 'number' as const } },
];

const TRADE_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'trade' } },
  { name: 'userId', type: { kind: 'ref' as const } },
  { name: 'tokenSymbol', type: { kind: 'string' as const } },
  { name: 'side', type: { kind: 'enum' as const, values: ['buy', 'sell'] } },
  { name: 'amount', type: { kind: 'number' as const } },
  { name: 'price', type: { kind: 'number' as const } },
  { name: 'timestamp', type: { kind: 'number' as const } },
];

const FOLLOWED_WALLET_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'followedWallet' } },
  { name: 'address', type: { kind: 'string' as const } },
  { name: 'userId', type: { kind: 'ref' as const } },
];

const WHALE_EVENT_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'whaleEvent' } },
  { name: 'walletAddress', type: { kind: 'string' as const } },
  { name: 'tokenSymbol', type: { kind: 'string' as const } },
  { name: 'amount', type: { kind: 'number' as const } },
  { name: 'eventType', type: { kind: 'enum' as const, values: ['buy', 'sell', 'transfer'] } },
  { name: 'timestamp', type: { kind: 'number' as const } },
  { name: 'signature', type: { kind: 'string' as const } },
];

const NOTIFICATION_FIELDS = [
  { name: 'type', type: { kind: 'literal' as const, value: 'notification' } },
  { name: 'userId', type: { kind: 'ref' as const } },
  { name: 'message', type: { kind: 'string' as const } },
  { name: 'read', type: { kind: 'boolean' as const } },
  { name: 'timestamp', type: { kind: 'number' as const } },
];

export async function ensureSchema(channel: RoolChannel | ReactiveChannel) {
  const schema = channel.getSchema();

  // Create or alter collections to include type field (required for createObject)
  const collections = [
    ['user', USER_FIELDS],
    ['position', POSITION_FIELDS],
    ['trade', TRADE_FIELDS],
    ['followedWallet', FOLLOWED_WALLET_FIELDS],
    ['whaleEvent', WHALE_EVENT_FIELDS],
    ['notification', NOTIFICATION_FIELDS],
  ] as const;

  for (const [name, fields] of collections) {
    if (schema[name]) {
      await channel.alterCollection(name, fields);
    } else {
      await channel.createCollection(name, fields);
    }
  }
}
