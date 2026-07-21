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

    return {
        name: params.playlist,
        playlist: playlist,
        playlistStyle: playlistStyle,
        playlistQueries: playlistQueries,
        evaluatedQueries: evaluatedQueries
    };
}