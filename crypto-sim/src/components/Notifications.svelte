<script lang="ts">
  import type { ReactiveChannel, ReactiveWatch } from '@rool-dev/svelte';

  interface Props {
    channel: ReactiveChannel;
    userId: string;
  }

  let { channel, userId }: Props = $props();

  let notifWatch = $state<ReactiveWatch | null>(null);

  $effect(() => {
    const w = channel.watch({ where: { type: 'notification', userId }, order: 'desc', limit: 20 });
    notifWatch = w;
    return () => w.close();
  });

  let notifications = $derived(notifWatch?.objects ?? []);
  let unreadCount = $derived(notifications.filter((n) => !n.read).length);

  async function markRead(id: string) {
    await channel.updateObject(id, { data: { read: true }, ephemeral: true });
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  }
</script>

<div class="relative">
  <div class="flex items-center gap-2">
    <span class="text-sm text-slate-600">Notifications</span>
    {#if unreadCount > 0}
      <span class="px-2 py-0.5 bg-rose-500 text-white text-xs font-medium rounded-full">{unreadCount}</span>
    {/if}
  </div>
  <div class="mt-2 max-h-48 overflow-y-auto space-y-2">
    {#if notifications.length === 0}
      <p class="text-sm text-slate-500">No notifications yet</p>
    {:else}
      {#each notifications as n (n.id)}
        <div
          class="p-3 rounded-lg text-sm {n.read ? 'bg-slate-50 text-slate-600' : 'bg-slate-100 text-slate-800 font-medium'}"
          role="button"
          tabindex="0"
          onclick={() => markRead(n.id)}
          onkeydown={(e) => e.key === 'Enter' && markRead(n.id)}
        >
          <p>{n.message}</p>
          <p class="text-xs text-slate-500 mt-1">{formatTime(n.timestamp as number)}</p>
        </div>
      {/each}
    {/if}
  </div>
</div>
