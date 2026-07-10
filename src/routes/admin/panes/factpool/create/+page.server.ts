import { type Actions } from "@sveltejs/kit";
import { createFactPool } from "$lib/factpools";

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();

        if (!name) {
            return {
                success: false,
                error: "Name is required"
            };
        }

        await createFactPool(name, description || undefined);

        return {
            success: true
        };
    }
};