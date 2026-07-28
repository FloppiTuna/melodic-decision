import { getArtistLikenesses } from "$lib/external_sources";
import { getFactPoolByName } from "$lib/factpools";
import { getArtistLikenessByArtistId } from "$lib/likeness";
import { getPlaylistByName, getPlaylistQueriesByPlaylistId, evaluatePlaylistQueries, getPlaylistStyleByPlaylistId } from "$lib/playlists";

export async function load({ params }) {
    const playlist = await getPlaylistByName(params.playlist);
    const playlistStyle = await getPlaylistStyleByPlaylistId(playlist?.id ?? -1);

    if (!playlist) {
        return {
            playlist: null,
            playlistStyle: null,
            playlistQueries: [],
            evaluatedQueries: []
        };
    }

    const playlistQueries = await getPlaylistQueriesByPlaylistId(playlist.id);
    const evaluatedQueries = await evaluatePlaylistQueries(playlist.id);
    console.log("playlist", playlist);
    console.log("playlistStyle", playlistStyle);

    // collect all artist facts from their respective fact pools
    const artists = new Set<{ name: string; id: number }>();
    for (const query of evaluatedQueries) {
        for (const row of query.rows) {
            artists.add({ name: row.artistName, id: row.artistId });
        }
    }

    const artistFacts: Record<string, string[]> = {};
    for (const artist of artists) {
        const factPool = await getFactPoolByName(artist.name);
        if (factPool) {
            artistFacts[artist.name] = factPool.facts.map(f => f.text);
        }
    }

    const artistLikenesses: Record<string, string[]> = {};
    for (const artist of artists) {
        const likenesses = await getArtistLikenessByArtistId(artist.id) || [];
        artistLikenesses[artist.name] = likenesses.map(l => l.imageUrl);
    }
    
    console.log("artistFacts", artistFacts);
    console.log("artistLikenesses", artistLikenesses);
    
    return {
        name: params.playlist,
        playlist: playlist,
        playlistStyle: playlistStyle,
        playlistQueries: playlistQueries,
        evaluatedQueries: evaluatedQueries,
        artistFacts: artistFacts,
        artistLikenesses: artistLikenesses
    };
}