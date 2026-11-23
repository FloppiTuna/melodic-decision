import {
    createArtistFactPool,
    createArtistFactPoolFact,
    getArtistFactPoolByArtistId,
} from "$lib/factpools";
import { getAllAlbums, getAllTracks, getArtistById } from "$lib/media";
import type { Actions } from "@sveltejs/kit";

export async function load({ params }) {
    const artistId = Number(params.artistId);
    const artist = await getArtistById(artistId);
    const artistFacts = artist
        ? await createArtistFactPool(artist).then(() => getArtistFactPoolByArtistId(artistId))
        : undefined;

    return {
        artist,
        albums: await getAllAlbums().then(albums => albums.filter(album => album.artistId === Number(artistId))),
        artistFacts,
    };
}

export const actions: Actions = {
    createFact: async ({ request, params }) => {
        const formData = await request.formData();
        const artistId = Number(params.artistId);
        const artist = await getArtistById(artistId);
        const text = formData.get("newFact")?.toString().trim();

        if (!artist) {
            return { success: false, error: "Artist not found." };
        }

        if (!text) {
            return { success: false, error: "Enter a fact before adding it." };
        }

        await createArtistFactPool(artist);
        await createArtistFactPoolFact(artistId, text);

        console.log("Created new fact for artist fact pool:", artist.name, text);
        return { success: true };
    }
};