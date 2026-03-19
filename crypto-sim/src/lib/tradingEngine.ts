/**
 * Trading Engine - Correct portfolio math for buy/sell
 * Operates on Rool objects via channel methods
 */
import type { RoolChannel } from '@rool-dev/sdk';
import { generateId } from '@rool-dev/svelte';

type ChannelLike = Pick<
  RoolChannel,
  'findObjects' | 'createObject' | 'updateObject' | 'deleteObjects' | 'checkpoint'
>;

export interface TradeResult {
  success: boolean;
  error?: string;
}

export async function executeBuy(
  channel: ChannelLike,
  userId: string,
  tokenSymbol: string,
  amount: number,
  price: number
): Promise<TradeResult> {
  const cost = price * amount;
  if (cost <= 0 || amount <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  const { objects: users } = await channel.findObjects({
    where: { type: 'user' },
    limit: 10,
  });
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };

  const cashBalance = (user.cash_balance as number) ?? 0;
  if (cashBalance < cost) {
    return { success: false, error: 'Insufficient funds' };
  }

  const { objects: positions } = await channel.findObjects({
    where: { type: 'position', userId, tokenSymbol },
    limit: 1,
  });
  const existingPosition = positions[0];

  const timestamp = Date.now();

  await channel.checkpoint('Trade');
  try {
    // Decrease cash
    await channel.updateObject(userId, {
      data: { cash_balance: cashBalance - cost },
      ephemeral: true,
    });

    if (existingPosition) {
      const oldAmount = (existingPosition.amount as number) ?? 0;
      const oldAvg = (existingPosition.avgEntryPrice as number) ?? 0;
      const totalCost = oldAmount * oldAvg + cost;
      const newAmount = oldAmount + amount;
      const newAvg = totalCost / newAmount;

      await channel.updateObject(existingPosition.id, {
        data: { amount: newAmount, avgEntryPrice: newAvg },
        ephemeral: true,
      });
    } else {
      await channel.createObject({
        data: {
          id: generateId(),
          type: 'position',
          userId,
          tokenSymbol,
          amount,
          avgEntryPrice: price,
        },
        ephemeral: true,
      });
    }

    await channel.createObject({
      data: {
        id: generateId(),
        type: 'trade',
        userId,
        tokenSymbol,
        side: 'buy',
        amount,
        price,
        timestamp,
      },
      ephemeral: true,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function executeSell(
  channel: ChannelLike,
  userId: string,
  tokenSymbol: string,
  amount: number,
  price: number
): Promise<TradeResult> {
  if (amount <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  const { objects: positions } = await channel.findObjects({
    where: { type: 'position', userId, tokenSymbol },
    limit: 1,
  });
  const position = positions[0];
  if (!position) return { success: false, error: 'No position to sell' };

  const currentAmount = (position.amount as number) ?? 0;
  if (amount > currentAmount) {
    return { success: false, error: `Insufficient balance (have ${currentAmount})` };
  }

  const { objects: users } = await channel.findObjects({
    where: { type: 'user' },
    limit: 10,
  });
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };

  const proceeds = price * amount;
  const cashBalance = (user.cash_balance as number) ?? 0;
  const timestamp = Date.now();

  await channel.checkpoint('Trade');
  try {
    // Increase cash
    await channel.updateObject(userId, {
      data: { cash_balance: cashBalance + proceeds },
      ephemeral: true,
    });

    const newAmount = currentAmount - amount;
    if (newAmount <= 0) {
      await channel.deleteObjects([position.id]);
    } else {
      await channel.updateObject(position.id, {
        data: { amount: newAmount },
        ephemeral: true,
      });
    }

    await channel.createObject({
      data: {
        id: generateId(),
        type: 'trade',
        userId,
        tokenSymbol,
        side: 'sell',
        amount,
        price,
        timestamp,
      },
      ephemeral: true,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
