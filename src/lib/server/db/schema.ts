import { boolean, integer, jsonb, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { MDBroadcastAspectRatio, MDDesignVariant, MDDidYouKnowFactPoolType, MDSourceType } from "$lib/types";

// A media source.
export const mediaSourceType = pgEnum("md_media_source_type", [
  MDSourceType.LocalFolder,
  MDSourceType.Jellyfin
]);
export const mediaSource = pgTable("media_source", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: mediaSourceType().notNull(),
  name: varchar({ length: 255 }).notNull(),
  config: jsonb().$type<Record<string, unknown>>(),
});

export type MediaSourceRow = typeof mediaSource.$inferSelect;

// A media item.
// export const mediaItem = pgTable("media_item", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   sourceId: integer()
//     .notNull()
//     .references(() => mediaSource.id, { onDelete: "cascade" }),
//   title: varchar({ length: 255 }).notNull(),
//   artist: varchar({ length: 255 }).notNull(),
// });

// export type MediaItemRow = typeof mediaItem.$inferSelect;

export const artists = pgTable("artists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  musicBrainzId: varchar({ length: 36 }).unique(),
});

export type ArtistRow = typeof artists.$inferSelect;

export const albums = pgTable("albums", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  releaseYear: integer().notNull().default(1111),
  artistId: integer()
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  musicBrainzId: varchar({ length: 36 }).unique(),
});

export type AlbumRow = typeof albums.$inferSelect;

export const tracks = pgTable("tracks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  albumId: integer()
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  trackNumber: integer(),
  musicBrainzId: varchar({ length: 36 }).unique(),
  path: text().notNull().unique(),
});

export type TrackRow = typeof tracks.$inferSelect;

export const factPoolType = pgEnum("md_fact_pool_type", [
  MDDidYouKnowFactPoolType.Global,
  MDDidYouKnowFactPoolType.ArtistSpecific,
]);

// A fact pool is a list of facts that can be rendered in the did you know section of the broadcast. 
// This can be used to show certain strings across all playlists.
export const factPool = pgTable("fact_pool", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  type: factPoolType().notNull().default(MDDidYouKnowFactPoolType.Global),
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

export const playlists = pgTable("playlists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  displayName: varchar({ length: 255 })
});

export type PlaylistRow = typeof playlists.$inferSelect;

export const designVariantEnum = pgEnum("md_design_variant", [MDDesignVariant.Bold2012, MDDesignVariant.Ascii1998]);

export const broadcastAspectRatioEnum = pgEnum("md_broadcast_aspect_ratio", [
  MDBroadcastAspectRatio.Aspect16by9,
  MDBroadcastAspectRatio.Aspect4by3,
]);

export const playlist_styles = pgTable("playlist_styles", {
  playlistId: integer().primaryKey().references(() => playlists.id, { onDelete: "cascade" }),
  aspectRatio: broadcastAspectRatioEnum().notNull().default(MDBroadcastAspectRatio.Aspect4by3),
  designVariant: designVariantEnum().notNull().default(MDDesignVariant.Bold2012),
});

export type PlaylistStyleRow = typeof playlist_styles.$inferSelect;

export const playlist_queries = pgTable("playlist_queries", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  playlistId: integer()
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  query: text().notNull(), // oighruhguhrwj WHY ARE I DOING THIS
}); // this is kinda fuckin stupid but it works for now leave me alone LEAVE ME A🍅NO I MS ORYR PL🍅🍅STOOP PLEAAA🍅🍅🍅SENOOOOO

export type PlaylistQueryRow = typeof playlist_queries.$inferSelect;



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
