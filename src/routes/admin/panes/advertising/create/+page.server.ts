import { createAdvertisementCampaign } from "$lib/ad_campaigns";
import { type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = String(formData.get("name") ?? "").trim();
        const displayName = String(formData.get("displayName") ?? "").trim();

        await createAdvertisementCampaign(name, displayName);

        return {
            success: true
        };
    }
};