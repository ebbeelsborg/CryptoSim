<script lang="ts">
  let expanded = $state(false);
</script>

<div class="bg-slate-100 rounded-xl border border-slate-200 p-4">
  <button
    class="w-full flex items-center justify-between text-left font-medium text-slate-800"
    onclick={() => (expanded = !expanded)}
  >
    How it works
    <span class="text-slate-500">{expanded ? '▼' : '▶'}</span>
  </button>
  {#if expanded}
    <div class="mt-4 space-y-3 text-sm text-slate-600">
      <p>
        <strong>Fake money simulation:</strong> You start with $1,000,000 virtual USD. All trades are simulated — no real funds, no wallet connection.
      </p>
      <p>
        <strong>Real prices:</strong> Crypto prices are fetched from CoinGecko and update every ~15 seconds.
      </p>
      <p>
        <strong>Whale tracking:</strong> Enter a Solana wallet address to follow it. When that wallet makes on-chain transactions, you'll see them in the Whale Feed and get notifications.
      </p>
      <p>
        <strong>Finding wallet addresses:</strong> Use Solscan, Solana Explorer, or similar tools to find wallet addresses from large holders or traders you want to copy.
      </p>
    </div>
  {/if}
</div>
