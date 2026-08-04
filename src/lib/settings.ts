import { eq } from "drizzle-orm";
import { db } from "./server/db/client";
import { settings } from "./server/db/schema";

export const SETTINGS_DEFAULTS = {
    // media settings

    /** Whether to omit remaster tags from the displayed track information. */
    shouldOmitRemasterTags: false,
} as const;

type SettingKey = keyof typeof SETTINGS_DEFAULTS;

type SettingValue<K extends SettingKey> = (typeof SETTINGS_DEFAULTS)[K];

function parseSettingValue<K extends SettingKey>(key: K, rawValue: string | null | undefined): SettingValue<K> {
    const fallback = SETTINGS_DEFAULTS[key];

    if (rawValue == null) {
        return fallback;
    }

    if (typeof fallback === "boolean") {
        return (rawValue === "true") as SettingValue<K>;
    }

    return rawValue as unknown as SettingValue<K>;
}

export async function getSettingByKey<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
    const result = await db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

    return parseSettingValue(key, result[0]?.value);
}

export async function setSetting<K extends SettingKey>(key: K, value: SettingValue<K>): Promise<void> {
    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    const existingSetting = await db
        .select({ id: settings.id })
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

    if (existingSetting[0]) {
        await db.update(settings).set({ value: storedValue, changedAt: Math.floor(Date.now() / 1000) }).where(eq(settings.key, key));
    } else {
        await db.insert(settings).values({ key, value: storedValue, changedAt: Math.floor(Date.now() / 1000) });
    }
}