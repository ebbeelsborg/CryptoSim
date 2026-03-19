<script lang="ts">
  import type { ReactiveChannel } from '@rool-dev/svelte';
  import { executeBuy, executeSell } from '../lib/tradingEngine.js';

  interface Props {
    channel: ReactiveChannel;
    userId: string;
    prices: Record<string, number>;
  }

  let { channel, userId, prices }: Props = $props();

  const TOKENS = [
    { symbol: 'sol', name: 'Solana' },
    { symbol: 'btc', name: 'Bitcoin' },
    { symbol: 'eth', name: 'Ethereum' },
    { symbol: 'bonk', name: 'Bonk' },
    { symbol: 'jup', name: 'Jupiter' },
  ];

  let selectedToken = $state('sol');
  let side = $state<'buy' | 'sell'>('buy');
  let amount = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);

  let price = $derived(prices[selectedToken] ?? 0);
  let costOrProceeds = $derived(parseFloat(amount || '0') * price);

  async function submit() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      error = 'Enter a valid amount';
      return;
    }
    if (price <= 0) {
      error = 'Price not available yet';
      return;
    }

    loading = true;
    error = null;
    success = false;

    try {
      const result = side === 'buy'
        ? await executeBuy(channel, userId, selectedToken.toUpperCase(), amt, price)
        : await executeSell(channel, userId, selectedToken.toUpperCase(), amt, price);

      if (result.success) {
        success = true;
        amount = '';
      } else {
        error = result.error ?? 'Trade failed';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
  <h2 class="text-lg font-semibold text-slate-800 mb-4">Trade</h2>

  <div class="flex gap-2 mb-4">
    <button
      class="flex-1 py-2 px-4 rounded-lg font-medium transition {side === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}"
      onclick={() => { side = 'buy'; error = null; success = false; }}
    >
      Buy
    </button>
    <button
      class="flex-1 py-2 px-4 rounded-lg font-medium transition {side === 'sell' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}"
      onclick={() => { side = 'sell'; error = null; success = false; }}
    >
      Sell
    </button>
  </div>

  <div class="space-y-4">
    <div>
      <label for="trade-token" class="block text-sm font-medium text-slate-700 mb-1">Token</label>
      <select
        id="trade-token"
        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
        bind:value={selectedToken}
        onchange={() => { error = null; success = false; }}
      >
        {#each TOKENS as t}
          <option value={t.symbol}>{t.name} ({t.symbol.toUpperCase()})</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="trade-amount" class="block text-sm font-medium text-slate-700 mb-1">Amount</label>
      <input
        id="trade-amount"
        type="number"
        step="any"
        min="0"
        placeholder="0"
        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
        bind:value={amount}
        oninput={() => { error = null; success = false; }}
      />
    </div>

    {#if price > 0}
      <p class="text-sm text-slate-500">
        Price: ${price.toLocaleString('en-US', { minimumFractionDigits: 4 })} •
        {side === 'buy' ? 'Cost' : 'Proceeds'}: ${costOrProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    {/if}

    {#if error}
      <p class="text-sm text-rose-600">{error}</p>
    {/if}
    {#if success}
      <p class="text-sm text-emerald-600">Trade successful!</p>
    {/if}

    <button
      class="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 {side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}"
      onclick={submit}
      disabled={loading || !amount || parseFloat(amount || '0') <= 0}
    >
      {loading ? 'Processing...' : side === 'buy' ? 'Buy' : 'Sell'} {selectedToken.toUpperCase()}
    </button>
  </div>
</div>
