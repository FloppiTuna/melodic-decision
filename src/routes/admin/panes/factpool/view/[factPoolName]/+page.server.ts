import { createFactPoolFact, getFactPoolByName } from "$lib/factpools";
import type { Actions } from "./$types";

export async function load({ params }) {
    return {
        factPool: await getFactPoolByName(params.factPoolName)
    };
}

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        await createFactPoolFact("GLOBAL", formData.get("newFact") as string);

        return {
            success: true
        };
    }
};