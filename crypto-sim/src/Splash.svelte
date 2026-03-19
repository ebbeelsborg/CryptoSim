<script lang="ts">
  interface Props {
    appName: string;
    onLogin: () => void;
  }

  let { appName, onLogin }: Props = $props();
</script>

<div class="min-h-dvh flex flex-col items-center justify-center bg-slate-50 p-8">
  <div class="text-center max-w-sm">
    <h1 class="text-3xl font-bold text-slate-900 mb-2">{appName}</h1>
    <p class="text-slate-500 mb-6">Paper trading + whale tracking. Sign in to get started.</p>
    <button
      class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
      onclick={onLogin}
    >
      Sign in with Rool
    </button>
    <p class="text-xs text-slate-400 mt-6">
      Opens Rool auth. If stuck, try
      <a href="https://console.rool.dev" target="_blank" rel="noopener" class="underline">console.rool.dev</a> first.
    </p>
  </div>
</div>
