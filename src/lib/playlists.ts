import { type MDPlaylist, MDDesignVariant, createPlaylist } from "./types";

export const playlists: MDPlaylist[] = [
    createPlaylist({
        name: "Christmas",
        displayName: "SOUNDS OF THE SEASONS: CHRISTMAS",
        style: {
            primaryColor: [
                "#BB2528",
                "#F8B229",
                "#165B33"
            ],
            designVariant: MDDesignVariant.Modern2011,
        },
        sources: [
            {
                type: "jellyfin",
                config: {
                    playlistId: "0647a25ef852f72541a86fffd289022a"
                }
            }
        ]
    }),
    createPlaylist({
        name: "Classic Rock",
        style: {
            primaryColor: [
                "#0000FF"
            ],
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
    }),
    createPlaylist({
        name: "Jazz",
        displayName: "Jazz",
        style: {
            designVariant: MDDesignVariant.Modern2011
        },
        sources: [
            {
                type: "jellyfin",
                config: {
                    playlistId: "6d97ce6972d20f92e9b1d95096d71752"
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
