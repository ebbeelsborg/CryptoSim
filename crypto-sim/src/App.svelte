<script lang="ts">
  import { createRool, type ReactiveChannel } from '@rool-dev/svelte';
  import Splash from './Splash.svelte';
  import Header from './Header.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import TradePanel from './components/TradePanel.svelte';
  import WhaleFeed from './components/WhaleFeed.svelte';
  import FollowWallet from './components/FollowWallet.svelte';
  import HowItWorks from './components/HowItWorks.svelte';
  import Notifications from './components/Notifications.svelte';
  import WhaleEventHandler from './components/WhaleEventHandler.svelte';
  import { initSpace } from './lib/init.js';
  import { createPriceStore } from './lib/priceStore.js';

  const APP_NAME = 'CryptoSim';

  const rool = createRool();
  rool.init();

  let channel = $state<ReactiveChannel | null>(null);
  let userId = $state<string | null>(null);
  let tab = $state<'dashboard' | 'trade' | 'whale' | 'follow'>('dashboard');
  let priceStore = $state<ReturnType<typeof createPriceStore> | null>(null);

  $effect(() => {
    if (rool.authenticated && rool.spaces && !channel) {
      openSpace();
    }
  });

  async function openSpace() {
    const spaces = rool.spaces!;
    const existing = spaces.find((s) => s.name === APP_NAME);

    let spaceId: string;
    if (existing) {
      spaceId = existing.id;
    } else {
      const newSpace = await rool.createSpace(APP_NAME);
      spaceId = newSpace.id;
    }

    channel = await rool.openChannel(spaceId, 'main');
    userId = await initSpace(channel);

    const store = createPriceStore();
    await store.load();
    priceStore = store;
  }

  $effect(() => {
    return () => priceStore?.destroy?.();
  });
</script>

{#if rool.authenticated === undefined}
  <div class="min-h-dvh flex items-center justify-center bg-slate-50">
    <p class="text-slate-500">Loading...</p>
  </div>
{:else if rool.authenticated === false}
  <Splash appName={APP_NAME} onLogin={() => rool.login(APP_NAME)} />
{:else}
  <div class="min-h-dvh flex flex-col bg-slate-50">
    <Header appName={APP_NAME} space={channel} onLogout={() => rool.logout()} />

    {#if !channel || !userId}
      <div class="flex-1 flex items-center justify-center">
        <p class="text-slate-500">Loading...</p>
      </div>
    {:else}
      <WhaleEventHandler {channel} {userId} />

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="flex flex-wrap gap-2">
            <button
              class="px-4 py-2 rounded-lg font-medium transition {tab === 'dashboard' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}"
              onclick={() => (tab = 'dashboard')}
            >
              Dashboard
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition {tab === 'trade' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}"
              onclick={() => (tab = 'trade')}
            >
              Trade
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition {tab === 'whale' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}"
              onclick={() => (tab = 'whale')}
            >
              Whale Feed
            </button>
            <button
              class="px-4 py-2 rounded-lg font-medium transition {tab === 'follow' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}"
              onclick={() => (tab = 'follow')}
            >
              Follow Wallet
            </button>
          </div>

          <HowItWorks />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
              {#if tab === 'dashboard'}
                <Dashboard channel={channel} userId={userId} prices={priceStore?.prices ?? {}} />
              {:else if tab === 'trade'}
                <TradePanel channel={channel} userId={userId} prices={priceStore?.prices ?? {}} />
              {:else if tab === 'whale'}
                <WhaleFeed {channel} />
              {:else}
                <FollowWallet {channel} userId={userId} />
              {/if}
            </div>
            <div>
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-4">
                <Notifications {channel} userId={userId} />
              </div>
            </div>
          </div>
        </div>
      </main>
    {/if}
  </div>
{/if}
