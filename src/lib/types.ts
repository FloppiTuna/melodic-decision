// A Melodic Decision playlist.
export enum MDDesignVariant {
    // Music Choice's design used from around 2011.
    Modern2011 = "modern2011",

}

// Style definitions for the playlist.
export type MDStyle = {
    // The set of primary colors for this playlist.
    primaryColor: string[];
    
    // An optional override for the "DID YOU KNOW?" header text.
    didYouKnowOverride?: string

    // Whether to use the globally defined "did you know" facts during broadcast or not. Defaults to true.
    useGlobalDidYouKnowFacts?: boolean;

    // What design variant ("era") to use for this playlist.
    designVariant: MDDesignVariant;
} 

export type MDSource = {
    // The type of source.
    type: string;

    // The source's configuration.
    config?: Record<string, any>;
}


export type MDSong = {
    // The title of the song.
    title: string;
    
    // The artist of the song.
    artist: string;

    // The artist ID of the song (if available).
    artistId?: string;

    // The album of the song.
    album?: string;

    releaseYear?: number;
    
    // The media URL for the song.
    mediaUrl: string;
}
export type MDSongPool = MDSong[];

export type MDPlaylist = {
    // The name for this playlist.
    name: string;
    
    // The display name for this playlist. This will be used on the broadcast.
    // If not provided, the 'name' field will be used.
    displayName?: string;

    // The style definitions for this playlist.
    style: MDStyle

    // The media sources for this playlist.
    sources: MDSource[];

    // Playlist-specific facts to appear in the "DID YOU KNOW?" section.
    didYouKnowFacts?: MDDidYouKnowFact[];
}

export enum MDDidYouKnowFactType {
    // A global fact that can be shown on any playlist.
    Global = "global",

    // A playlist-specific fact that should only be shown on a specific playlist.
    PlaylistSpecific = "playlistSpecific",
}

export type MDDidYouKnowFact = {
    // The fact text.
    text: string;

    // The fact's type.
    type: MDDidYouKnowFactType;

    // The playlist name this fact is associated with (if type is PlaylistSpecific).
    associatedPlaylist?: string;
}

// default style values for a MD playlist
export const defaultMDStyle: MDStyle = {
    primaryColor: "#000000",
    designVariant: MDDesignVariant.Modern2011,
    useGlobalDidYouKnowFacts: true,
};

export function createPlaylist(input: Partial<MDPlaylist> & { name: string }): MDPlaylist {
    return {
        name: input.name,
        displayName: input.displayName || input.name,
        style: {
            ...defaultMDStyle,
            ...(input.style || {}),
        },
        sources: input.sources || [],
        didYouKnowFacts: input.didYouKnowFacts || [],
    };
}