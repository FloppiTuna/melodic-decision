import type { MDDidYouKnowFact, MDPlaylist } from '$lib/types';
import { didYouKnowDatabase } from '$lib/dyk';

export async function load({ params, fetch }) {
    // load playlist
    const res = await fetch(`/api/playlists/${params.playlist}`);
    if (res.ok) {
        const playlist = await res.json();
        console.log(playlist);
        return { playlist: playlist as MDPlaylist, didYouKnowGlobal: didYouKnowDatabase as MDDidYouKnowFact[] };
    }
    console.error(`Failed to load playlist: ${res.status}`);
    return { playlist: null };
}