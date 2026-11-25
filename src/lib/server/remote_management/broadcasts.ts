import type { WebSocket } from 'ws';

export interface BroadcastState {
  id: number;
  name: string;
  joinedAt: Date;
  socket: WebSocket;
}

export type BroadcastRegistrationResult =
  | { success: true; broadcast: BroadcastState }
  | { success: false; reason: 'invalid-name' | 'already-registered' };

const registeredBroadcasts = new Map<string, BroadcastState>();
let nextBroadcastId = 1;

export function registerBroadcast(
  broadcastName: string,
  socket: WebSocket
): BroadcastRegistrationResult {
  const name = broadcastName.trim();
  if (!name) return { success: false, reason: 'invalid-name' };

  const existing = registeredBroadcasts.get(name);
  if (existing) {
    return existing.socket === socket
      ? { success: true, broadcast: existing }
      : { success: false, reason: 'already-registered' };
  }

  const broadcast: BroadcastState = {
    id: nextBroadcastId++,
    name,
    joinedAt: new Date(),
    socket
  };
  registeredBroadcasts.set(name, broadcast);
  return { success: true, broadcast };
}

export function getRegisteredBroadcast(broadcastName: string): BroadcastState | null {
  return registeredBroadcasts.get(broadcastName) ?? null;
}

export function getAllRegisteredBroadcasts(): BroadcastState[] {
  return [...registeredBroadcasts.values()];
}

export function unregisterBroadcast(broadcastName: string): boolean {
  return registeredBroadcasts.delete(broadcastName);
}

export function unregisterBroadcastsForSocket(socket: WebSocket): number {
  let removed = 0;
  for (const [name, broadcast] of registeredBroadcasts) {
    if (broadcast.socket === socket) {
      registeredBroadcasts.delete(name);
      removed++;
    }
  }
  return removed;
}
