import { getArtistFactPoolByArtistId, getFactPoolByName } from "$lib/factpools";
import { getAllAlbums, getAllTracks, getArtistById } from "$lib/media";

export async function load({ params }) {
    const artistId = Number(params.artistId);
    const artist = await getArtistById(artistId);

    return {
        artist,
        albums: await getAllAlbums().then(albums => albums.filter(album => album.artistId === Number(artistId))),

        artistFacts: await getArtistFactPoolByArtistId(artistId)
            ?? (artist ? await getFactPoolByName(artist.name) : undefined),
    };
}