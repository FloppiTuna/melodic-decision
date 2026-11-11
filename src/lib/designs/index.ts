import type { Component } from "svelte";

import Ascii1998 from "./Ascii1998.svelte";
import Bold2012 from "./Bold2012.svelte";
import {
	MDBroadcastAspectRatio,
	MDDesignVariant,
} from "$lib/types";

export type MDDesignOption = {
    type: "boolean" | "string" | "number" | "select";
    id: string;
    name: string;
    description: string;
    defaultValue?: boolean | string | number;
    options?: string[];
}

export type MDDesignOptionSection = {
    name: string;
    description: string;
    options: MDDesignOption[];
}

export type MDDesignMetadata = {
	name: string;
	description: string;
	config: {
		supportedAspectRatios: readonly MDBroadcastAspectRatio[];
		supportsPrimaryColor: boolean;
		supportsDidYouKnowFacts: boolean;
		supportsAdvertisements: boolean;
	};
    options?: MDDesignOptionSection[];
};

export type MDDesignDefinition = MDDesignMetadata & {
	component: Component<any>;
};

export const designMetadata = {
	[MDDesignVariant.Ascii1998]: {
		name: "Ascii1998",
		description: "Music Choice's \"ASCII\" design, used in 1998.",
		config: {
			supportedAspectRatios: [MDBroadcastAspectRatio.Aspect4by3],
			supportsPrimaryColor: false,
			supportsDidYouKnowFacts: false,
			supportsAdvertisements: false,
		},
        options: [
            {
                name: "General",
                description: "General options.",
                options: [
                    {
                        type: "boolean",
                        id: "append-extra-space-to-song-name",
                        name: "Append extra space to song name",
                        description: "Whether to append an extra space to the song name.",
                        defaultValue: true,
                    }
                ]
            }
        ]
	},
	[MDDesignVariant.Bold2012]: {
		name: "Bold2012",
		description: "Music Choice's \"bold\" design, introduced in 2012.",
		config: {
			supportedAspectRatios: [
				MDBroadcastAspectRatio.Aspect16by9,
				MDBroadcastAspectRatio.Aspect4by3,
			],
			supportsPrimaryColor: true,
			supportsDidYouKnowFacts: true,
			supportsAdvertisements: true,
		},
	},
} satisfies Record<MDDesignVariant, MDDesignMetadata>;

export const designs = {
	[MDDesignVariant.Ascii1998]: {
		...designMetadata[MDDesignVariant.Ascii1998],
		component: Ascii1998,
	},
	[MDDesignVariant.Bold2012]: {
		...designMetadata[MDDesignVariant.Bold2012],
		component: Bold2012,
	},
} satisfies Record<MDDesignVariant, MDDesignDefinition>;

export type MDDesignComponent = (typeof designs)[MDDesignVariant];

export default designs;