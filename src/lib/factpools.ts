import { eq } from "drizzle-orm";
import { db } from "./server/db/client";
import { factPool, factPoolFact, type FactPoolFactRow, type FactPoolRow } from "./server/db/schema";
import type { MDDidYouKnowFactPoolType } from "./types";

export type FactPool = FactPoolRow & {
    facts: FactPoolFactRow[];
};

export async function getAllFactPools(): Promise<FactPool[]> {
    const rows = await db
        .select({
            pool: factPool,
            fact: factPoolFact,
        })
        .from(factPool)
        .leftJoin(factPoolFact, eq(factPoolFact.factPoolId, factPool.id));

    const factPools = new Map<number, FactPool>();

    for (const row of rows) {
        const existingPool = factPools.get(row.pool.id);

        if (existingPool) {
            if (row.fact) {
                existingPool.facts.push(row.fact);
            }

            continue;
        }

        factPools.set(row.pool.id, {
            ...row.pool,
            facts: row.fact ? [row.fact] : [],
        });
    }

    return [...factPools.values()];
}

export async function createFactPool(name: string, type: MDDidYouKnowFactPoolType, description?: string): Promise<FactPoolRow> {
    const result = await db.insert(factPool).values({ name, type, description }).returning();
    return result[0];
}

export async function createFactPoolFact(factPoolName: string, text: string): Promise<FactPoolFactRow> {
    const factPoolData = await getFactPoolByName(factPoolName);

    if (!factPoolData) {
        throw new Error(`Fact pool with name "${factPoolName}" not found.`);
    }

    const result = await db.insert(factPoolFact).values({ factPoolId: factPoolData.id, text }).returning();
    return result[0];
}

export async function getFactPoolByName(name: string): Promise<FactPool | undefined> {
    const rows = await db
        .select({
            pool: factPool,
            fact: factPoolFact,
        })
        .from(factPool)
        .leftJoin(factPoolFact, eq(factPoolFact.factPoolId, factPool.id))
        .where(eq(factPool.name, name));

    if (rows.length === 0) {
        return undefined;
    }

    const factPoolData: FactPool = {
        ...rows[0].pool,
        facts: [],
    };

    for (const row of rows) {
        if (row.fact) {
            factPoolData.facts.push(row.fact);
        }
    }

    return factPoolData;
}