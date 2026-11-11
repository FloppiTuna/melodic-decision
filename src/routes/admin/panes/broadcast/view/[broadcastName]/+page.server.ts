import { fail } from "@sveltejs/kit";
import {
    createOrUpdateBroadcastStyle,
    getBroadcastByName,
    getBroadcastStyleByBroadcastId,
} from "$lib/broadcast";
import type { Actions } from "./$types";
import { designMetadata, type MDDesignMetadata } from "$lib/designs";
import { MDDesignVariant } from "$lib/types";

export const actions: Actions = {
    updateStyle: async ({ params, request }) => {
        const formData = await request.formData();
        const designVariant = String(formData.get("designVariant") ?? "");

        if (!Object.values(MDDesignVariant).includes(designVariant as MDDesignVariant)) {
            return fail(400, { error: "Invalid design variant." });
        }

        const broadcast = await getBroadcastByName(params.broadcastName);
        if (!broadcast) {
            return fail(404, { error: "Broadcast not found." });
        }

        const selectedDesign = designMetadata[designVariant as MDDesignVariant] as MDDesignMetadata;
        const designOptions: Record<string, boolean | string | number> = {};

        for (const section of selectedDesign.options ?? []) {
            for (const option of section.options) {
                const rawValue = formData.get(`option:${option.id}`);

                if (option.type === "boolean") {
                    designOptions[option.id] = rawValue !== null;
                    continue;
                }

                if (rawValue === null) {
                    if (option.defaultValue !== undefined) {
                        designOptions[option.id] = option.defaultValue;
                    }
                    continue;
                }

                if (option.type === "number") {
                    const numberValue = Number(rawValue);
                    if (!Number.isFinite(numberValue)) {
                        return fail(400, { error: `Invalid value for ${option.name}.` });
                    }
                    designOptions[option.id] = numberValue;
                } else {
                    const stringValue = String(rawValue);
                    if (option.type === "select" && !option.options?.includes(stringValue)) {
                        return fail(400, { error: `Invalid value for ${option.name}.` });
                    }
                    designOptions[option.id] = stringValue;
                }
            }
        }

        await createOrUpdateBroadcastStyle(broadcast.id, {
            designVariant: designVariant as MDDesignVariant,
            designOptions,
        });

        return { success: true };
    },
};

export async function load({ params }) {
    const broadcast = await getBroadcastByName(params.broadcastName);
    const broadcastStyle = await getBroadcastStyleByBroadcastId(broadcast?.id ?? 0);

    console.log("broadcast", broadcast);
    console.log("broadcastStyle", broadcastStyle);

    return {
        broadcast: broadcast,
        broadcastStyle: broadcastStyle,
        designMetadata: designMetadata
    };
}
