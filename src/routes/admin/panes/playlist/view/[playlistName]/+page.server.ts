import { getPlaylistByName } from "$lib/playlists";

export async function load({ params }) {
    const playlist = await getPlaylistByName(params.playlistName);
    // console.log("playlist", playlist);
    return {
        playlist: playlist
    };
}