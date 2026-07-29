import { getBroadcastByName, getBroadcastStyleByBroadcastId } from "$lib/broadcast";
import type { Actions } from "./$types";

export async function load({ params }) {
    const broadcast = await getBroadcastByName(params.broadcastName);
    const broadcastStyle = await getBroadcastStyleByBroadcastId(broadcast?.id ?? 0);

    console.log("broadcast", broadcast);
    console.log("broadcastStyle", broadcastStyle);

    return {
        broadcast: broadcast,
        broadcastStyle: broadcastStyle
    };
}
