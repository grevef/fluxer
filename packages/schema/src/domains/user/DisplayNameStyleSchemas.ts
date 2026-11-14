// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	DISPLAY_NAME_EFFECT_IDS,
	DISPLAY_NAME_FONT_IDS,
	MAX_DISPLAY_NAME_STYLE_COLORS,
} from '@fluxer/constants/src/DisplayNameStyleConstants';
import {ColorType, Int32Type} from '@fluxer/schema/src/primitives/SchemaPrimitives';
import {z} from 'zod';

export const DisplayNameStylesRequest = z.object({
	font_id: z
		.number()
		.int()
		.refine((value) => DISPLAY_NAME_FONT_IDS.includes(value), 'Unknown display name font')
		.describe('The display name font identifier'),
	effect_id: z
		.number()
		.int()
		.refine((value) => DISPLAY_NAME_EFFECT_IDS.includes(value), 'Unknown display name effect')
		.describe('The display name effect identifier'),
	colors: z
		.array(ColorType)
		.min(1)
		.max(MAX_DISPLAY_NAME_STYLE_COLORS)
		.describe('One or two colors as integers; gradient effects use both'),
});

export type DisplayNameStylesRequest = z.infer<typeof DisplayNameStylesRequest>;

export const DisplayNameStylesResponse = z.object({
	font_id: Int32Type.describe('The display name font identifier'),
	effect_id: Int32Type.describe('The display name effect identifier'),
	colors: z.array(Int32Type).describe('The display name colors as integers'),
});

export type DisplayNameStylesResponse = z.infer<typeof DisplayNameStylesResponse>;
