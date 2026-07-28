import { and, eq } from "drizzle-orm";
import { db } from "./server/db/client";
import { artists, artist_likeness, type ArtistRow, type ArtistLikenessRow } from "./server/db/schema";

export async function getArtistLikenessByArtistId(artistId: number): Promise<ArtistLikenessRow[] | undefined> {
    const result = await db.select().from(artist_likeness).where(eq(artist_likeness.artistId, artistId));
    return result;
}

export async function createArtistLikeness(artistId: number, imageUrl: string): Promise<ArtistLikenessRow> {
    console.log(`Creating artist likeness for artistId: ${artistId}, imageUrl: ${imageUrl}`);
    const result = await db.insert(artist_likeness).values({ artistId, imageUrl }).returning();
    return result[0];
}