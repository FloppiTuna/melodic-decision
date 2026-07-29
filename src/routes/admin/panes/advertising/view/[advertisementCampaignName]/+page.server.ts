import { getAdvertisementCampaignByName, getAdvertisementCampaignMediaByCampaignId, addMediaToAdvertisementCampaign, deleteMediaFromAdvertisementCampaign, uploadAdvertisementMediaFile } from "$lib/ad_campaigns";
import type { Actions } from "../$types";

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 MB

export async function load({ params }) {
    const advertisementCampaign = await getAdvertisementCampaignByName(params.advertisementCampaignName);
    const advertisementCampaignMedia = await getAdvertisementCampaignMediaByCampaignId(advertisementCampaign?.id ?? 0);

    return {
        advertisementCampaign: advertisementCampaign,
        advertisementCampaignMedia: advertisementCampaignMedia
    };
}

export const actions: Actions = {
    addMedia: async ({ request, params }) => {    
        const advertisementCampaign = await getAdvertisementCampaignByName(params.advertisementCampaignName);

        const formData = await request.formData();
        const newMediaName = formData.get("newMediaName") as string;
        const newMediaFile = formData.get("newMediaFile") as File;

        if (newMediaFile.size > MAX_MEDIA_SIZE) {
            return {
                success: false,
                error: "Media file is too large. Raise this limit in the config or compress the file before uploading."
            };
        }

        // todo: kinda stupid i can probs just put this in the addMediaToAdvertisementCampaign function but whatever
        const filePath = await uploadAdvertisementMediaFile(newMediaFile);

        await addMediaToAdvertisementCampaign(advertisementCampaign?.id ?? 0, newMediaName, filePath);

        return {
            success: true
        };
    },

    deleteMedia: async ({ request, params }) => {
        const formData = await request.formData();
        const mediaId = formData.get("mediaId") as string;

        await deleteMediaFromAdvertisementCampaign(Number(mediaId));

        return {
            success: true
        };
    }
};