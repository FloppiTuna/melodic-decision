import { type Actions } from "@sveltejs/kit";
import { getAllMediaSources, createMediaSource } from "$lib/sources";
import { MDSourceType } from "$lib/types";
import { scanSource } from "$lib/scanner";

export async function load({ params }) {
    return {
        sources: await getAllMediaSources()
    };
}



export const actions: Actions = {
    create: async ({ request }) => {
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
    },
    scan: async ({ request }) => {
        const formData = await request.formData();
        const sourceId = Number(formData.get("sourceId"));

        if (!Number.isInteger(sourceId)) {
            return {
                success: false,
                error: "A valid source ID is required"
            };
        }

        await scanSource(sourceId);

        return {
            success: true
        };
    }
};
