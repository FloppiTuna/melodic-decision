import { getAllBroadcasts } from "$lib/broadcast";
import { getAllFactPools } from "$lib/factpools";
import { getAllPlaylists } from "$lib/playlists";
import { getAllAdvertisementCampaigns } from "$lib/ad_campaigns";

export async function load() {
    return {
        playlists: await getAllPlaylists(),
        factPools: await getAllFactPools(),
        broadcasts: await getAllBroadcasts(),
        advertisementCampaigns: await getAllAdvertisementCampaigns()
    };
}