import { boolean, integer, jsonb, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { MDBroadcastAspectRatio, MDDesignVariant, MDDidYouKnowFactType } from "$lib/types";

// A fact pool is a list of facts that can be rendered in the did you know section of the broadcast. 
// This can be used to show certain strings across all playlists.

export const factPool = pgTable("fact_pool", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: text(),
});

export type FactPoolRow = typeof factPool.$inferSelect;

export const factPoolFact = pgTable("fact_pool_fact", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  factPoolId: integer()
    .notNull()
    .references(() => factPool.id, { onDelete: "cascade" }),
  text: text().notNull(),
});

export type FactPoolFactRow = typeof factPoolFact.$inferSelect;
// export const designVariantEnum = pgEnum("md_design_variant", [MDDesignVariant.Modern2011]);

// export const broadcastAspectRatioEnum = pgEnum("md_broadcast_aspect_ratio", [
//   MDBroadcastAspectRatio.Aspect16by9,
//   MDBroadcastAspectRatio.Aspect4by3,
// ]);

// export const didYouKnowFactTypeEnum = pgEnum("md_did_you_know_fact_type", [
//   MDDidYouKnowFactType.Global,
//   MDDidYouKnowFactType.PlaylistSpecific,
// ]);

// export const playlist = pgTable("playlists", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull().unique(),
//   displayName: varchar({ length: 255 }),
// });

// export const playlistStyle = pgTable("playlist_styles", {
//   playlistId: integer()
//     .primaryKey()
//     .references(() => playlist.id, { onDelete: "cascade" }),
//   primaryColor: text("primary_color").array(),
//   didYouKnowOverride: varchar({ length: 255 }),
//   useGlobalDidYouKnowFacts: boolean().notNull().default(true),
//   designVariant: designVariantEnum().notNull().default(MDDesignVariant.Modern2011),
//   aspectRatio: broadcastAspectRatioEnum()
//     .notNull()
//     .default(MDBroadcastAspectRatio.Aspect4by3),
// });

// export const playlistSource = pgTable("playlist_sources", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   playlistId: integer()
//     .notNull()
//     .references(() => playlist.id, { onDelete: "cascade" }),
//   type: varchar({ length: 255 }).notNull(),
//   config: jsonb().$type<Record<string, unknown>>(),
// });

// export const playlistDidYouKnowFact = pgTable("playlist_did_you_know_facts", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   playlistId: integer().references(() => playlist.id, { onDelete: "cascade" }),
//   text: text().notNull(),
//   type: didYouKnowFactTypeEnum().notNull(),
//   associatedPlaylist: varchar({ length: 255 }),
// });

// export type PlaylistRow = typeof playlist.$inferSelect;
// export type PlaylistStyleRow = typeof playlistStyle.$inferSelect;
// export type PlaylistSourceRow = typeof playlistSource.$inferSelect;
// export type PlaylistDidYouKnowFactRow = typeof playlistDidYouKnowFact.$inferSelect;
