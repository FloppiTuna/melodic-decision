import { getAllAlbums, getAllArtists, getAllTracks } from "$lib/media";

export async function load({ params }) {
    return {
        artists: await getAllArtists(),
        tracks: await getAllTracks(),
        albums: await getAllAlbums()
    };
}