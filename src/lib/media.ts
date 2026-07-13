import { eq } from "drizzle-orm";
import { db } from "./server/db/client";
import { artists, albums, tracks, type ArtistRow, type AlbumRow, type TrackRow } from "./server/db/schema";

export async function getArtistById(id: number): Promise<ArtistRow | undefined> {
    const result = await db.select().from(artists).where(eq(artists.id, id));
    return result[0];
}

export async function getAlbumById(id: number): Promise<AlbumRow | undefined> {
    const result = await db.select().from(albums).where(eq(albums.id, id));
    return result[0];
}

export async function getTrackById(id: number): Promise<TrackRow | undefined> {
    const result = await db.select().from(tracks).where(eq(tracks.id, id));
    return result[0];
}

export async function getAllArtists(): Promise<ArtistRow[]> {
    return db.select().from(artists);
}

export async function getAllAlbums(): Promise<AlbumRow[]> {
    return db.select().from(albums);
}

export async function getAllTracks(): Promise<TrackRow[]> {
    return db.select().from(tracks);
}

export async function createArtist(name: string, musicBrainzId: string): Promise<ArtistRow> {
    const result = await db.insert(artists).values({ name, musicBrainzId }).returning();
    return result[0];
}

export async function createAlbum(title: string, artistId: number, musicBrainzId: string): Promise<AlbumRow> {
    const result = await db.insert(albums).values({ title, artistId, musicBrainzId }).returning();
    return result[0];
}

export async function createTrack(title: string, albumId: number, trackNumber: number, musicBrainzId: string): Promise<TrackRow> {
    const result = await db.insert(tracks).values({ title, albumId, trackNumber, musicBrainzId }).returning();
    return result[0];
}