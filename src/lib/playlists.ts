import { eq, sql } from "drizzle-orm";
import { db } from "./server/db/client";
import { playlists, playlist_queries, tracks, albums, artists, type PlaylistRow, type PlaylistQueryRow, type TrackRow } from "./server/db/schema";

// export const playlists: MDPlaylist[] = [
//     createPlaylist({
//         name: "Christmas",
//         displayName: "SOUNDS OF THE SEASONS: CHRISTMAS",
//         style: {
//             primaryColor: [
//                 "#BB2528",
//                 "#F8B229",
//                 "#165B33"
//             ],
//             designVariant: MDDesignVariant.Modern2011,
//         },
//         sources: [
//             {
//                 type: "jellyfin",
//                 config: {
//                     playlistId: "0647a25ef852f72541a86fffd289022a"
//                 }
//             }
//         ]
//     }),
//     createPlaylist({
//         name: "Classic Rock",
//         style: {
//             designVariant: MDDesignVariant.Modern2011,
//         },
//         sources: [
//             {
//                 type: "jellyfin",
//                 config: {
//                     playlistId: "184f7820df91b7403e3758bc584160d4"
//                 }
//             }
//         ]
//     }),
//     createPlaylist({
//         name: "Jazz",
//         displayName: "Jazz",
//         style: {
//             designVariant: MDDesignVariant.Modern2011
//         },
//         sources: [
//             {
//                 type: "jellyfin",
//                 config: {
//                     playlistId: "c85928bc10f61e2837dd40a23bad43e8"
//                 }
//             }
//         ]
//     }),
//     createPlaylist({
//         name: "SYNTHPOP",
//         displayName: "SYNTHPOP",
//         style: {
//             designVariant: MDDesignVariant.Modern2011
//         },
//         sources: [
//             {
//                 type: "jellyfin",
//                 config: {
//                     playlistId: "e5b79bc6fbc9f69e3b6f4cc8a057176b"
//                 }
//             }
//         ]
//     })
// ];

// export async function getAllPlaylists(): Promise<MDPlaylist[]> {
//     return Promise.resolve(playlists);
// }

// export async function getPlaylistByName(name: string): Promise<MDPlaylist | undefined> {
//     return Promise.resolve(playlists.find(p => p.name === name));
// }

export const getAllPlaylists = async (): Promise<PlaylistRow[]> => {
    return db.select().from(playlists);
}

export const getPlaylistByName = async (name: string): Promise<PlaylistRow | undefined> => {
    const result = await db.select().from(playlists).where(eq(playlists.name, name));
    return result[0];
}

export const getPlaylistById = async (id: number): Promise<PlaylistRow | undefined> => {
    const result = await db.select().from(playlists).where(eq(playlists.id, id));
    return result[0];
}

export const getPlaylistQueriesByPlaylistId = async (playlistId: number): Promise<PlaylistQueryRow[]> => {
    return db.select().from(playlist_queries).where(eq(playlist_queries.playlistId, playlistId));
}

export type TrackWithExtendedMetadata = TrackRow & {
    albumTitle: string;
    artistName: string;
    releaseYear: number;
    artistId: number;
};

export type EvaluatedPlaylistQuery = {
    query: string;
    rows: TrackWithExtendedMetadata[];
    error?: string;
};

export const evaluatePlaylistQueries = async (playlistId: number): Promise<EvaluatedPlaylistQuery[]> => {
    const queries = await getPlaylistQueriesByPlaylistId(playlistId);
    const results: EvaluatedPlaylistQuery[] = [];

    for (const query of queries) {
        try {
            const rows = await db.select({
                id: tracks.id,
                title: tracks.title,
                albumId: tracks.albumId,
                artistId: artists.id,
                trackNumber: tracks.trackNumber,
                releaseYear: albums.releaseYear,
                musicBrainzId: tracks.musicBrainzId,
                path: tracks.path,

                albumTitle: albums.title,
                artistName: artists.name,
            })
            .from(tracks)
            .innerJoin(albums, eq(tracks.albumId, albums.id))
            .innerJoin(artists, eq(albums.artistId, artists.id))
            .where(sql.raw(query.query));
            results.push({ query: query.query, rows });
        } catch (error) {
            results.push({
                query: query.query,
                rows: [],
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    return results;
}

export const createPlaylist = async (name: string, displayName?: string): Promise<PlaylistRow> => {
    const result = await db.insert(playlists).values({ name, displayName }).returning();
    return result[0];
}

export const createPlaylistQuery = async (playlistId: number, query: string): Promise<PlaylistQueryRow> => {
    const result = await db.insert(playlist_queries).values({ playlistId, query }).returning();
    return result[0];
}