import { eq } from "drizzle-orm";
import { db } from "./server/db/client";
import { mediaSource, type MediaSourceRow } from "./server/db/schema";
import type { MDSourceType } from "./types";

export async function getMediaSourceById(id: number): Promise<MediaSourceRow | undefined> {
    const result = await db.select().from(mediaSource).where(eq(mediaSource.id, id));
    return result[0];
}

export async function getAllMediaSources(): Promise<MediaSourceRow[]> {
    return db.select().from(mediaSource);
}

export async function createMediaSource(type: MDSourceType, name: string, config: Record<string, any>): Promise<MediaSourceRow> {
    const result = await db.insert(mediaSource).values({ type, name, config }).returning();
    return result[0];
}