import { eq, sql } from "drizzle-orm";
import { db } from "./server/db/client";
import { broadcasts, broadcast_styles, playlists, type BroadcastRow, type BroadcastStyleRow, type PlaylistRow } from "./server/db/schema";

export async function getBroadcastById(id: number): Promise<BroadcastRow | undefined> {
    const result = await db.select().from(broadcasts).where(eq(broadcasts.id, id));
    return result[0];
}

export async function getBroadcastByName(name: string): Promise<BroadcastRow | undefined> {
    const result = await db.select().from(broadcasts).where(eq(broadcasts.name, name));
    return result[0];
}

export async function getAllBroadcasts(): Promise<BroadcastRow[]> {
    return db.select().from(broadcasts);
}

export async function createBroadcast(name: string, displayName: string | null, associatedPlaylistId: number | null): Promise<BroadcastRow> {
    const result = await db.insert(broadcasts).values({ name, displayName, associatedPlaylist: associatedPlaylistId }).returning();
    return result[0];
}

export async function updateBroadcast(id: number, name: string, displayName: string | null, associatedPlaylistId: number | null): Promise<BroadcastRow | undefined> {
    const result = await db.update(broadcasts)
        .set({ name, displayName, associatedPlaylist: associatedPlaylistId })
        .where(eq(broadcasts.id, id))
        .returning();
    return result[0];
}

export async function deleteBroadcast(id: number): Promise<void> {
    await db.delete(broadcasts).where(eq(broadcasts.id, id));
}

export async function getBroadcastStyleByBroadcastId(broadcastId: number): Promise<BroadcastStyleRow | undefined> {
    const result = await db.select().from(broadcast_styles).where(eq(broadcast_styles.broadcastId, broadcastId));
    return result[0];
}