/**
 * Whale Worker - Polls followed wallets every 15 seconds
 * Stores followed wallet list in memory (frontend sends via API)
 * Creates WhaleEvents and broadcasts; frontend creates Notifications in Rool
 */

import { getNewSignatures } from '../services/whaleService.js';
import { broadcast } from '../realtime.js';

const followedWallets = new Map<string, Set<string>>(); // userId -> Set<address>

export function addFollowedWallet(userId: string, address: string) {
  let set = followedWallets.get(userId);
  if (!set) {
    set = new Set();
    followedWallets.set(userId, set);
  }
  set.add(address);
}

export function removeFollowedWallet(userId: string, address: string) {
  const set = followedWallets.get(userId);
  if (set) {
    set.delete(address);
    if (set.size === 0) followedWallets.delete(userId);
  }
}

export function getFollowedWallets(): Map<string, Set<string>> {
  return followedWallets;
}

export function setFollowedWalletsForUser(userId: string, addresses: string[]) {
  followedWallets.set(userId, new Set(addresses));
}

const INTERVAL_MS = 15_000;

export function startWhaleWorker() {
  async function poll() {
    const allAddresses = new Set<string>();
    for (const addrs of followedWallets.values()) {
      for (const a of addrs) allAddresses.add(a);
    }

    for (const address of allAddresses) {
      try {
        const newSigs = await getNewSignatures(address, 5);
        for (const sig of newSigs) {
          const whaleEvent = {
            walletAddress: address,
            tokenSymbol: 'SOL',
            amount: 0,
            type: 'transfer',
            timestamp: sig.blockTime ?? Math.floor(Date.now() / 1000),
            signature: sig.signature,
          };
          broadcast('whale:event', whaleEvent);
        }
      } catch (err) {
        console.error('[WhaleWorker]', address, err);
      }
    }
  }

  setInterval(poll, INTERVAL_MS);
}
