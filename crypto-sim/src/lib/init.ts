/**
 * Initialize CryptoSim space: schema + session user
 */
import type { RoolChannel } from '@rool-dev/sdk';
import type { ReactiveChannel } from '@rool-dev/svelte';
import { ensureSchema } from './rool-schema.js';
import { INITIAL_CASH } from './constants.js';

export async function initSpace(channel: RoolChannel | ReactiveChannel): Promise<string> {
  await ensureSchema(channel);

  const userId = channel.userId;
  const { objects: users } = await channel.findObjects({
    where: { type: 'user' },
    limit: 10,
  });

  const existing = users.find((u) => u.id === userId);
  if (existing) return userId;

  await channel.createObject({
    data: {
      id: userId,
      type: 'user',
      name: 'Trader',
      cash_balance: INITIAL_CASH,
    },
    ephemeral: true,
  });

  return userId;
}
