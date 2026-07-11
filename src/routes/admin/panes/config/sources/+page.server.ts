import { type Actions } from "@sveltejs/kit";
import { getAllMediaSources, createMediaSource } from "$lib/sources";
import { MDSourceType } from "$lib/types";

export async function load({ params }) {
    return {
        sources: await getAllMediaSources()
    };
}



export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const type = String(formData.get("type") ?? "").trim() as MDSourceType;
        const name = String(formData.get("name") ?? "").trim();
        const config = String(formData.get("config") ?? "").trim();

        if (!type || !name) {
            return {
                success: false,
                error: "Type and name are required"
            };
        }

        await createMediaSource(type, name, config ? JSON.parse(config) : {});

        return {
            success: true
        };
    }
};
