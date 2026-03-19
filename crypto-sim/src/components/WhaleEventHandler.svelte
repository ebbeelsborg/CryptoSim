<script lang="ts">
  /**
   * Listens for whale:event from WebSocket.
   * When received for a followed wallet: creates WhaleEvent + Notification in Rool.
   */
  import type { ReactiveChannel, ReactiveWatch } from '@rool-dev/svelte';
  import { generateId } from '@rool-dev/svelte';
  import { subscribe } from '../lib/websocket.js';

  interface Props {
    channel: ReactiveChannel;
    userId: string;
  }

  let { channel, userId }: Props = $props();

  let followedWatch = $state<ReactiveWatch | null>(null);
  const followedRef = { current: new Set<string>() };

  $effect(() => {
    const w = channel.watch({ where: { type: 'followedWallet', userId } });
    followedWatch = w;
    return () => w.close();
  });

  $effect(() => {
    followedRef.current = new Set(
      (followedWatch?.objects ?? []).map((f) => (f.address as string)?.toLowerCase()).filter(Boolean)
    );
  });

  $effect(() => {
    const unsub = subscribe((event, payload) => {
      if (event !== 'whale:event') return;
      const { walletAddress } = payload as { walletAddress: string };
      if (!followedRef.current.has(walletAddress.toLowerCase())) return;

      const ev = payload as { walletAddress: string; tokenSymbol?: string; type?: string; timestamp?: number; signature?: string };
      const tokenSymbol = (ev.tokenSymbol ?? 'SOL').toUpperCase();
      const type = ev.type ?? 'transfer';
      const timestamp = ev.timestamp ?? Math.floor(Date.now() / 1000);
      const signature = ev.signature ?? '';

      channel.createObject({
        data: {
          id: generateId(),
          type: 'whaleEvent',
          walletAddress: ev.walletAddress,
          tokenSymbol,
          amount: 0,
          eventType: type,
          timestamp,
          signature,
        },
        ephemeral: true,
      });

      channel.createObject({
        data: {
          id: generateId(),
          type: 'notification',
          userId,
          message: `Wallet ${ev.walletAddress.slice(0, 8)}... ${type}d ${tokenSymbol}`,
          read: false,
          timestamp: Date.now(),
        },
        ephemeral: true,
      });
    });
    return unsub;
  });
</script>
