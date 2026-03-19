<script lang="ts">
  import type { ReactiveChannel, ReactiveWatch } from '@rool-dev/svelte';

  interface Props {
    channel: ReactiveChannel;
    userId: string;
    prices: Record<string, number>;
  }

  let { channel, userId, prices }: Props = $props();

  let positionsWatch = $state<ReactiveWatch | null>(null);
  let userObj = $state<{ cash_balance: number } | null>(null);

  $effect(() => {
    const w = channel.watch({ where: { type: 'position', userId }, order: 'desc' });
    positionsWatch = w;
    return () => w.close();
  });

  $effect(() => {
    const u = channel.object(userId);
    userObj = (u.data ?? null) as { cash_balance: number } | null;
    return () => u.close();
  });

  let positions = $derived(positionsWatch?.objects ?? []);
  let cashBalance = $derived(userObj?.cash_balance ?? 0);

  let portfolioValue = $derived(
    positions.reduce((sum, p) => {
      const sym = (p.tokenSymbol as string)?.toUpperCase() ?? '';
      const price = prices[sym.toLowerCase()] ?? 0;
      return sum + (p.amount as number) * price;
    }, 0)
  );

  let totalValue = $derived(cashBalance + portfolioValue);
  const initialCash = 1_000_000;
  let pnl = $derived(totalValue - initialCash);
  let pnlPercent = $derived(initialCash > 0 ? (pnl / initialCash) * 100 : 0);
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p class="text-sm text-slate-500 font-medium">Portfolio Value</p>
      <p class="text-2xl font-bold text-slate-900 mt-1">
        ${totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p class="text-sm text-slate-500 font-medium">Cash Balance</p>
      <p class="text-2xl font-bold text-slate-900 mt-1">
        ${cashBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p class="text-sm text-slate-500 font-medium">P&L</p>
      <p class="text-2xl font-bold mt-1 {pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
        <span class="text-base font-normal">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
      </p>
    </div>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <h2 class="px-5 py-4 font-semibold text-slate-800 border-b border-slate-200">Holdings</h2>
    {#if positions.length === 0}
      <div class="p-12 text-center text-slate-500">
        <p class="text-lg mb-2">No positions yet</p>
        <p class="text-sm">Use the Trade panel to buy crypto</p>
      </div>
    {:else}
      <div class="divide-y divide-slate-100">
        {#each positions as pos (pos.id)}
          {@const sym = (pos.tokenSymbol as string)?.toUpperCase() ?? '?'}
          {@const amt = pos.amount as number}
          {@const price = prices[(pos.tokenSymbol as string)?.toLowerCase()] ?? 0}
          {@const value = amt * price}
          <div class="px-5 py-4 flex justify-between items-center hover:bg-slate-50">
            <div>
              <p class="font-medium text-slate-900">{sym}</p>
              <p class="text-sm text-slate-500">{amt.toLocaleString()} @ ${(pos.avgEntryPrice as number)?.toFixed(4)}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-slate-900">${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p class="text-sm text-slate-500">{amt.toLocaleString()} {sym}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
