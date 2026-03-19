# CryptoSim

A crypto paper trading + whale tracking app built on [Rool.dev](https://rool.dev) — a persistent object model for stateful, real-time applications.

## Features

- **$1,000,000 virtual USD** — Start with fake money, trade at real prices
- **Buy/sell crypto** — SOL, BTC, ETH, BONK, JUP and more at live CoinGecko prices
- **Portfolio tracking** — P&L, holdings, real-time updates
- **Whale tracking** — Follow Solana wallets and see their on-chain transactions
- **Notifications** — Get notified when followed wallets trade

## Tech Stack

- **Frontend**: Svelte 5, TailwindCSS, Rool Svelte SDK
- **Backend**: Node.js, Express, WebSocket
- **Data**: Rool (persistent objects), CoinGecko API, Solana RPC

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Run backend + frontend (requires 2 terminals, or use concurrently)
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd crypto-sim && npm run dev
```

Open http://localhost:5173 and sign in with Rool to start trading.

## Project Structure

```
/backend          # Express API, price worker, whale worker, WebSocket
  /services      # Price service (CoinGecko), Whale service (Solana RPC)
  /workers       # Background polling
  /routes        # REST endpoints

/crypto-sim      # Svelte 5 frontend
  /components   # Dashboard, TradePanel, WhaleFeed, FollowWallet
  /lib          # Trading engine, API client, Rool schema
```

## How It Works

1. **Fake money** — All trades are simulated. No real funds, no wallet connection.
2. **Real prices** — Fetched from CoinGecko every ~15 seconds.
3. **Whale tracking** — Enter a Solana wallet address to follow it. New transactions appear in the Whale Feed.
4. **Finding addresses** — Use [Solscan](https://solscan.io) or Solana Explorer to find wallet addresses from large holders.

## Environment

- `VITE_API_URL` — Backend API URL (default: proxied in dev)
- `VITE_WS_URL` — WebSocket URL (default: same host in dev)
