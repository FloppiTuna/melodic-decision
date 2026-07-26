import { and, eq } from "drizzle-orm";
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

export async function createArtist(name: string, musicBrainzId?: string): Promise<ArtistRow> {
    const existing = await db.select().from(artists).where(eq(artists.name, name));

    if (existing[0]) {
        const artist = existing[0];

        if (!artist.musicBrainzId && musicBrainzId) {
            const updated = await db
                .update(artists)
                .set({ musicBrainzId })
                .where(eq(artists.id, artist.id))
                .returning();
            return updated[0];
        }

        return artist;
    }

    const result = await db.insert(artists).values({ name, musicBrainzId }).returning();
    return result[0];
}

export async function createAlbum(title: string, releaseYear: number, artistId: number, musicBrainzId?: string): Promise<AlbumRow> {
    const existing = await db.select().from(albums).where(and(eq(albums.artistId, artistId), eq(albums.title, title)));

    if (existing[0]) {
        const album = existing[0];

        if (!album.musicBrainzId || !album.releaseYear || musicBrainzId) {
            const updated = await db
                .update(albums)
                .set({ musicBrainzId, releaseYear })
                .where(eq(albums.id, album.id))
                .returning();
            return updated[0];
        }

        return album;
    }

    const result = await db.insert(albums).values({ title, releaseYear, artistId, musicBrainzId }).returning();
    return result[0];
}

export async function createTrack(title: string, albumId: number, path: string, trackNumber?: number, musicBrainzId?: string): Promise<TrackRow> {
    const existing = await db.select().from(tracks).where(eq(tracks.path, path));

    if (existing[0]) {
        const track = existing[0];

        if ( track.title !== title || track.albumId !== albumId || track.trackNumber !== trackNumber || (!track.musicBrainzId && musicBrainzId)) {
            const updated = await db
                .update(tracks)
                .set({ title, albumId, trackNumber, musicBrainzId: track.musicBrainzId ?? musicBrainzId })
                .where(eq(tracks.id, track.id))
                .returning();

            return updated[0];
        }

        return track;
    }

    const result = await db.insert(tracks).values({ title, albumId, trackNumber, musicBrainzId, path }).returning();
    return result[0];
}