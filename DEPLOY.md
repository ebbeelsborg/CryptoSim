# Deploy CryptoSim Backend to Render

## 1. Deploy the backend on Render

1. Push your code to GitHub (if not already).

2. Go to [dashboard.render.com](https://dashboard.render.com) and sign in.

3. Click **New +** → **Web Service**.

4. Connect your GitHub repo (`rool-crypto-sim`).

5. Configure:
   - **Name**: `cryptosim-backend` (or any name)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for always-on)

6. Click **Create Web Service**. Wait for the first deploy to finish.

7. Copy your service URL, e.g. `https://cryptosim-backend-xxxx.onrender.com`.

---

## 2. Point the frontend at the backend

Build the frontend with the backend URL:

```bash
cd crypto-sim
VITE_API_URL=https://cryptosim-backend-xxxx.onrender.com \
VITE_WS_URL=wss://cryptosim-backend-xxxx.onrender.com \
npm run build
```

Replace `cryptosim-backend-xxxx` with your actual Render service URL (without `https://`).

---

## 3. Republish the app to Rool

```bash
rool app publish crypto-sim crypto-sim/dist -n "CryptoSim"
```

---

## Free tier note

On the free tier, Render spins down the service after ~15 minutes of inactivity. The first request after that can take 30–60 seconds to wake it up. For always-on, use a paid instance.
