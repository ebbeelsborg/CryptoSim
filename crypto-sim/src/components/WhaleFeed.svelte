<script lang="ts">
  import type { ReactiveChannel, ReactiveWatch } from '@rool-dev/svelte';

  interface Props {
    channel: ReactiveChannel;
  }

  let { channel }: Props = $props();

  let eventsWatch = $state<ReactiveWatch | null>(null);

  $effect(() => {
    const w = channel.watch({ where: { type: 'whaleEvent' }, order: 'desc', limit: 50 });
    eventsWatch = w;
    return () => w.close();
  });

  let events = $derived(eventsWatch?.objects ?? []);

  function formatTime(ts: number) {
    const d = new Date(ts * 1000);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  }

  function shortAddress(addr: string) {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }
</script>

<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <h2 class="px-5 py-4 font-semibold text-slate-800 border-b border-slate-200">Whale Feed</h2>
  <div class="max-h-96 overflow-y-auto">
    {#if events.length === 0}
      <div class="p-12 text-center text-slate-500">
        <p class="text-lg mb-2">No whale activity yet</p>
        <p class="text-sm">Follow a Solana wallet to see their transactions here</p>
      </div>
    {:else}
      <div class="divide-y divide-slate-100">
        {#each events as ev (ev.id)}
          {@const type = (ev.eventType ?? ev.type ?? 'transfer') as string}
          {@const isBuy = type === 'buy'}
          <div class="px-5 py-3 hover:bg-slate-50 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center {isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
              {#if isBuy}↑{:else}↓{/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900">
                Wallet {shortAddress(ev.walletAddress as string)} {type}d {(ev.tokenSymbol as string)?.toUpperCase() ?? 'SOL'}
              </p>
              <p class="text-xs text-slate-500">{formatTime(ev.timestamp as number)}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
