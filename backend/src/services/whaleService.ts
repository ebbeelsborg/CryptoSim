/**
 * Whale Tracking Service - Polls Solana RPC for wallet transactions
 * Uses getSignaturesForAddress to detect new transactions
 */

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export interface SolanaSignature {
  signature: string;
  blockTime: number | null;
  err: unknown;
}

const seenSignatures = new Set<string>();

export async function getSignaturesForAddress(
  address: string,
  limit = 20
): Promise<SolanaSignature[]> {
  const res = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [address, { limit }],
    }),
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message ?? 'Solana RPC error');
  }

  const signatures = (json.result ?? []) as SolanaSignature[];
  return signatures;
}

export async function getNewSignatures(
  address: string,
  limit = 10
): Promise<SolanaSignature[]> {
  const signatures = await getSignaturesForAddress(address, limit);
  const newOnes: SolanaSignature[] = [];

  for (const sig of signatures) {
    const key = `${address}:${sig.signature}`;
    if (!seenSignatures.has(key)) {
      seenSignatures.add(key);
      newOnes.push(sig);
    }
  }

  return newOnes;
}

export function getTransactionDetails(signature: string): Promise<unknown> {
  return fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
    }),
  })
    .then((r) => r.json())
    .then((j) => j.result);
}
