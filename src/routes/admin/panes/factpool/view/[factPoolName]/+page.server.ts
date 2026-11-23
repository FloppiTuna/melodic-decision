import { createFactPoolFact, deleteFactById, getFactPoolByName } from "$lib/factpools";
import type { Actions } from "./$types";

export async function load({ params }) {
    return {
        factPool: await getFactPoolByName(params.factPoolName)
    };
}

export const actions: Actions = {
    createFact: async ({ request, params }) => {
        const formData = await request.formData();
        const factPoolName = params.factPoolName;
        // i need a time machien so i can go back in time and slap myself in the face for choosing to do stuff this way oh my gog
        await createFactPoolFact(factPoolName, formData.get("newFact") as string);

        return {
            success: true
        };
    },
    deleteFact: async ({ request }) => {
        const formData = await request.formData();
        const factId = Number(formData.get("factId"));

        if (!Number.isInteger(factId)) {
            return {
                success: false,
                error: "A valid fact ID is required"
            };
        }

        await deleteFactById(factId);

        return {
            success: true
        };
    }
};