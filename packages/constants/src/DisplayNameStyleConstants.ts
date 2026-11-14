// SPDX-License-Identifier: AGPL-3.0-or-later

export const DisplayNameFonts = {
	DEFAULT: 0,
	BANGERS: 1,
	BIORHYME: 2,
	CHERRY_BOMB: 3,
	CHICLE: 4,
	MUSEO_MODERNO: 5,
	PIXELIFY: 6,
	ZILLA_SLAB: 7,
	ORBITRON: 8,
	PACIFICO: 9,
	CREEPSTER: 10,
	LOBSTER: 11,
	SILKSCREEN: 12,
} as const;

export type DisplayNameFont = (typeof DisplayNameFonts)[keyof typeof DisplayNameFonts];

export const DisplayNameEffects = {
	SOLID: 0,
	GRADIENT: 1,
	NEON: 2,
	TOON: 3,
	POP: 4,
} as const;

export type DisplayNameEffect = (typeof DisplayNameEffects)[keyof typeof DisplayNameEffects];

export const DISPLAY_NAME_FONT_IDS: ReadonlyArray<number> = Object.values(DisplayNameFonts);
export const DISPLAY_NAME_EFFECT_IDS: ReadonlyArray<number> = Object.values(DisplayNameEffects);

export const MAX_DISPLAY_NAME_STYLE_COLORS = 2;

export interface DisplayNameStyles {
	font_id: number;
	effect_id: number;
	colors: Array<number>;
}
