import { getBroadcastById, getBroadcastByName, getBroadcastStyleByBroadcastId } from "$lib/broadcast";
import { getArtistLikenesses } from "$lib/external_sources";
import { getFactPoolByName } from "$lib/factpools";
import { getArtistLikenessByArtistId } from "$lib/likeness";
import { getPlaylistByName, getPlaylistQueriesByPlaylistId, evaluatePlaylistQueries, getPlaylistById } from "$lib/playlists";

export async function load({ params }) {
    // load broadcast by broadcastName
    const broadcastName = params.broadcastName;
    const broadcast = await getBroadcastByName(broadcastName);
    console.log("broadcast", broadcast);

    if (!broadcast) {
        return {
            broadcast: null,
            broadcastStyle: null,
            playlist: null,
            playlistQueries: [],
            evaluatedQueries: []
        };
    }

    if (!broadcast.associatedPlaylist) {
        return {
            broadcast: broadcast,
            broadcastStyle: null,
            playlist: null,
            playlistQueries: [],
            evaluatedQueries: []
        };
    }

    const broadcastStyle = await getBroadcastStyleByBroadcastId(broadcast.id);
    console.log("broadcastStyle", broadcastStyle);
    const playlist = await getPlaylistById(broadcast.associatedPlaylist);
    console.log("playlist", playlist);

    if (!playlist) {
        return {
            playlist: null,
            broadcastStyle: null,
            playlistStyle: null,
            playlistQueries: [],
            evaluatedQueries: []
        };
    }

    const playlistQueries = await getPlaylistQueriesByPlaylistId(playlist.id);
    const evaluatedQueries = await evaluatePlaylistQueries(playlist.id);
    console.log("playlistQueries", playlistQueries);
    console.log("evaluatedQueries", evaluatedQueries);

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
        name: broadcast.name,
        broadcast: broadcast,
        broadcastStyle: broadcastStyle,
        playlist: playlist,
        playlistQueries: playlistQueries,
        evaluatedQueries: evaluatedQueries,
        artistFacts: artistFacts,
        artistLikenesses: artistLikenesses
    };
}