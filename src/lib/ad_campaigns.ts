import { eq, sql } from "drizzle-orm";
import { db } from "./server/db/client";
import { advertisement_campaigns, advertisement_campaign_media, type AdvertisementCampaignRow, type AdvertisementCampaignMediaRow } from "./server/db/schema";
import { saveStaticFile } from "./server/storage";
import path from "node:path";

export const getAdvertisementCampaignById = async (id: number): Promise<AdvertisementCampaignRow | undefined> => {
    const result = await db.select().from(advertisement_campaigns).where(eq(advertisement_campaigns.id, id));
    return result[0];
}

export const getAdvertisementCampaignByName = async (name: string): Promise<AdvertisementCampaignRow | undefined> => {
    const result = await db.select().from(advertisement_campaigns).where(eq(advertisement_campaigns.name, name));
    return result[0];
}

export const getAllAdvertisementCampaigns = async (): Promise<AdvertisementCampaignRow[]> => {
    return db.select().from(advertisement_campaigns);
}

export const createAdvertisementCampaign = async (name: string, displayName: string | null): Promise<AdvertisementCampaignRow> => {
    const result = await db.insert(advertisement_campaigns).values({ name, displayName }).returning();
    return result[0];
}

export const updateAdvertisementCampaign = async (id: number, name: string, displayName: string | null): Promise<AdvertisementCampaignRow | undefined> => {
    const result = await db.update(advertisement_campaigns)
        .set({ name, displayName })
        .where(eq(advertisement_campaigns.id, id))
        .returning();
    return result[0];
}

export const deleteAdvertisementCampaign = async (id: number): Promise<void> => {
    await db.delete(advertisement_campaigns).where(eq(advertisement_campaigns.id, id));
}

export const getAdvertisementCampaignMediaByCampaignId = async (campaignId: number): Promise<AdvertisementCampaignMediaRow[]> => {
    return db.select().from(advertisement_campaign_media).where(eq(advertisement_campaign_media.campaignId, campaignId));
}

export const addMediaToAdvertisementCampaign = async (campaignId: number, name: string, mediaPath: string): Promise<AdvertisementCampaignMediaRow> => {
    const result = await db.insert(advertisement_campaign_media).values({ campaignId, name, mediaPath }).returning();
    return result[0];
}

export const deleteMediaFromAdvertisementCampaign = async (mediaId: number): Promise<void> => {
    await db.delete(advertisement_campaign_media).where(eq(advertisement_campaign_media.id, mediaId));
}

export const uploadAdvertisementMediaFile = async (file: File): Promise<string> => {
    const extension = file.name.includes('.')
        ? `.${file.name.split('.').pop()}`
        : '';
    const fileName = `${path.basename(file.name, path.extname(file.name))}-${Date.now()}${extension}`;
    return saveStaticFile('uploads', fileName, Buffer.from(await file.arrayBuffer()));
}