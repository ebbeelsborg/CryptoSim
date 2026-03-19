import { API_URL } from './constants.js';

export async function fetchPrices() {
  const res = await fetch(`${API_URL}/api/prices`);
  if (!res.ok) throw new Error(await res.text());
  const { prices } = await res.json();
  return prices;
}

export async function followWallet(userId: string, address: string) {
  const res = await fetch(`${API_URL}/api/solana/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, address }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function unfollowWallet(userId: string, address: string) {
  const res = await fetch(`${API_URL}/api/solana/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, address }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getFollowedWallets(userId: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/solana/followed?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await res.text());
  const { addresses } = await res.json();
  return addresses ?? [];
}

export async function syncFollowedWallets(userId: string, addresses: string[]) {
  const res = await fetch(`${API_URL}/api/solana/followed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, addresses }),
  });
  if (!res.ok) throw new Error(await res.text());
}
