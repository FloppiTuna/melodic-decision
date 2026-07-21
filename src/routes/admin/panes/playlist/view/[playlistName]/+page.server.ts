import { getPlaylistByName, getPlaylistQueriesByPlaylistId, evaluatePlaylistQueries, createPlaylistQuery } from "$lib/playlists";
import type { Actions } from "./$types";

export async function load({ params }) {
    const playlist = await getPlaylistByName(params.playlistName);

    if (!playlist) {
        return {
            playlist: null,
            playlistQueries: []
        };
    }

    const playlistQueries = await getPlaylistQueriesByPlaylistId(playlist.id);
    const evaluatedQueries = await evaluatePlaylistQueries(playlist.id);
    // console.log("playlist", playlist);
    return {
        playlist: playlist,
        playlistQueries: playlistQueries,
        evaluatedQueries: evaluatedQueries
    };
}

export const actions: Actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const query = formData.get("query");
        const playlist = await getPlaylistByName(params.playlistName);

        if (!playlist || typeof query !== "string" || !query.trim()) {
            return {
                success: false
            };
        }

        await createPlaylistQuery(playlist.id, query);

        return {
            success: true
        };
    }
};