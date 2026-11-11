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
        options: [
            {
                name: "Cycles",
                description: "Cycle configuration.",
                options: [
                    {
                        type: "number",
                        id: "cycle-duration",
                        name: "Cycle duration",
                        description: "The duration of a cycle, in seconds.",
                        defaultValue: 30,
                    },
                    {
                        type: "number",
                        id: "minimum-cycles-until-horizontal-switch",
                        name: "Minimum cycles until horizontal switch",
                        description: "The minimum number of cycles before switching the horizontal layout.",
                        defaultValue: 1,
                    },
                    {
                        type: "number",
                        id: "maximum-cycles-until-horizontal-switch",
                        name: "Maximum cycles until horizontal switch",
                        description: "The maximum number of cycles before switching the horizontal layout.",
                        defaultValue: 5,
                    },
                    {
                        type: "number",
                        id: "minimum-cycles-until-vertical-switch",
                        name: "Minimum cycles until vertical switch",
                        description: "The minimum number of cycles before switching the vertical layout.",
                        defaultValue: 2,
                    },
                    {
                        type: "number",
                        id: "maximum-cycles-until-vertical-switch",
                        name: "Maximum cycles until vertical switch",
                        description: "The maximum number of cycles before switching the vertical layout.",
                        defaultValue: 8,
                    },
                    {
                        type: "number",
                        id: "minimum-cycles-until-primary-color-switch",
                        name: "Minimum cycles until primary color switch",
                        description: "The minimum number of cycles before switching the primary color.",
                        defaultValue: 4,
                    },
                    {
                        type: "number",
                        id: "maximum-cycles-until-primary-color-switch",
                        name: "Maximum cycles until primary color switch",
                        description: "The maximum number of cycles before switching the primary color.",
                        defaultValue: 28,
                    },
                    {
                        type: "number",
                        id: "minimum-cycles-until-bar-style-switch",
                        name: "Minimum cycles until bar style switch",
                        description: "The minimum number of cycles before switching the bar style. (solid to outline)",
                        defaultValue: 1,
                    },
                    {
                        type: "number",
                        id: "maximum-cycles-until-bar-style-switch",
                        name: "Maximum cycles until bar style switch",
                        description: "The maximum number of cycles before switching the bar style. (solid to outline)",
                        defaultValue: 5,
                    },
                    {
                        type: "number",
                        id: "minimum-cycles-until-advertisement-switch",
                        name: "Minimum cycles until advertisement switch",
                        description: "The minimum number of cycles before showing an advertisement for one cycle.",
                        defaultValue: 1,
                    },
                    {
                        type: "number",
                        id: "maximum-cycles-until-advertisement-switch",
                        name: "Maximum cycles until advertisement switch",
                        description: "The maximum number of cycles before showing an advertisement for one cycle.",
                        defaultValue: 5,
                    }
                ]
            }
        ]
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