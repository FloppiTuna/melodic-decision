import { createBroadcast } from "$lib/broadcast";
import { type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = String(formData.get("name") ?? "").trim();
        const displayName = String(formData.get("displayName") ?? "").trim();
        const associatedPlaylist = Number(formData.get("associatedPlaylist") ?? NaN);

        await createBroadcast(name, displayName, associatedPlaylist);

        return {
            success: true
        };
    }
};