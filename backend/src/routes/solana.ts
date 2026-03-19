import { Router } from 'express';
import { getSignaturesForAddress } from '../services/whaleService.js';
import {
  addFollowedWallet,
  removeFollowedWallet,
  setFollowedWalletsForUser,
  getFollowedWallets,
} from '../workers/whaleWorker.js';

export const solanaRoutes = Router();

solanaRoutes.get('/signatures/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const sigs = await getSignaturesForAddress(address, limit);
    res.json({ signatures: sigs });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

solanaRoutes.post('/follow', (req, res) => {
  const { userId, address } = req.body;
  if (!userId || !address) {
    return res.status(400).json({ error: 'userId and address required' });
  }
  addFollowedWallet(userId, address);
  res.json({ ok: true });
});

solanaRoutes.post('/unfollow', (req, res) => {
  const { userId, address } = req.body;
  if (!userId || !address) {
    return res.status(400).json({ error: 'userId and address required' });
  }
  removeFollowedWallet(userId, address);
  res.json({ ok: true });
});

solanaRoutes.get('/followed', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  const wallets = getFollowedWallets().get(userId);
  res.json({ addresses: wallets ? Array.from(wallets) : [] });
});

solanaRoutes.post('/followed', (req, res) => {
  const { userId, addresses } = req.body;
  if (!userId || !Array.isArray(addresses)) {
    return res.status(400).json({ error: 'userId and addresses[] required' });
  }
  setFollowedWalletsForUser(userId, addresses);
  res.json({ ok: true });
});
