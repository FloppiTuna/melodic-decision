import { type Actions } from "@sveltejs/kit";
import { createPlaylist } from "$lib/playlists";

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = String(formData.get("name") ?? "").trim();
        const displayName = String(formData.get("displayName") ?? "").trim();
;
        await createPlaylist(name, displayName || undefined);

        return {
            success: true
        };
    }
};