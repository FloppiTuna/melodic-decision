import { getAllFactPools } from "$lib/factpools";
import { getAllPlaylists } from "$lib/playlists";

export async function load() {
    return {
        playlists: await getAllPlaylists(),
        factPools: await getAllFactPools()
    };
}