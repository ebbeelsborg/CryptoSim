<script lang="ts">
  import type { ReactiveChannel, ReactiveWatch } from '@rool-dev/svelte';
  import { generateId } from '@rool-dev/svelte';
  import { followWallet, unfollowWallet, getFollowedWallets, syncFollowedWallets } from '../lib/api.js';

  interface Props {
    channel: ReactiveChannel;
    userId: string;
  }

  let { channel, userId }: Props = $props();

  let followedWatch = $state<ReactiveWatch | null>(null);
  let input = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    const w = channel.watch({ where: { type: 'followedWallet', userId }, order: 'desc' });
    followedWatch = w;
    return () => w.close();
  });

  let followed = $derived(followedWatch?.objects ?? []);

  // Sync followed wallets to backend when they change
  $effect(() => {
    const addrs = followed.map((f) => f.address as string).filter(Boolean);
    if (addrs.length > 0) syncFollowedWallets(userId, addrs);
  });

  async function add() {
    const addr = input.trim();
    if (!addr) return;

    loading = true;
    error = null;

    try {
      const existing = followed.find((f) => (f.address as string)?.toLowerCase() === addr.toLowerCase());
      if (existing) {
        error = 'Already following this wallet';
        return;
      }

      await channel.createObject({
        data: {
          id: generateId(),
          type: 'followedWallet',
          address: addr,
          userId,
        },
        ephemeral: true,
      });

      await followWallet(userId, addr);
      input = '';
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function remove(obj: { id: string; address: string }) {
    try {
      await channel.deleteObjects([obj.id]);
      await unfollowWallet(userId, obj.address);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function shortAddress(addr: string) {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  }
</script>

<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <h2 class="px-5 py-4 font-semibold text-slate-800 border-b border-slate-200">Follow Wallet</h2>
  <div class="p-5 space-y-4">
    <div class="flex gap-2">
      <input
        type="text"
        placeholder="Solana wallet address..."
        class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 text-sm"
        bind:value={input}
        onkeydown={(e) => e.key === 'Enter' && add()}
      />
      <button
        class="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50"
        onclick={add}
        disabled={loading || !input.trim()}
      >
        {loading ? '...' : 'Follow'}
      </button>
    </div>
    {#if error}
      <p class="text-sm text-rose-600">{error}</p>
    {/if}
    <div class="space-y-2">
      {#each followed as f (f.id)}
        {@const addr = f.address as string}
        <div class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
          <code class="text-sm text-slate-700 font-mono">{shortAddress(addr)}</code>
          <button
            class="text-sm text-rose-600 hover:text-rose-700 font-medium"
            onclick={() => remove({ id: f.id, address: addr })}
          >
            Unfollow
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
