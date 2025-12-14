import { type MDPlaylist, MDDesignVariant, createPlaylist } from "./types";

export const playlists: MDPlaylist[] = [
    createPlaylist({
        name: "Christmas",
        displayName: "SOUNDS OF THE SEASONS: CHRISTMAS",
        style: {
            primaryColor: "#D6001C",
            designVariant: MDDesignVariant.Modern2011,
        },
        sources: [
            {
                type: "jellyfin",
                config: {
                    playlistId: "74f64cab4d776693eecbc2016c161589"
                }
            }
        ]
    }),
    createPlaylist({
        name: "Classic Rock",
        style: {
            primaryColor: "#0000FF",
            designVariant: MDDesignVariant.Modern2011,
        },
        sources: [
            {
                type: "jellyfin",
                config: {
                    playlistId: "184f7820df91b7403e3758bc584160d4"
                }
            }
        ]
    })
];

export async function getAllPlaylists(): Promise<MDPlaylist[]> {
    return Promise.resolve(playlists);
}

export async function getPlaylistByName(name: string): Promise<MDPlaylist | undefined> {
    return Promise.resolve(playlists.find(p => p.name === name));
}
