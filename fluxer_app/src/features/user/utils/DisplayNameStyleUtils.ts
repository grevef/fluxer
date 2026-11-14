// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/DisplayNameStyle.module.css';
import {
	type DisplayNameEffect,
	DisplayNameEffects,
	type DisplayNameFont,
	DisplayNameFonts,
	type DisplayNameStyles,
} from '@fluxer/constants/src/DisplayNameStyleConstants';
import type {MessageDescriptor} from '@lingui/core';
import {msg} from '@lingui/core/macro';
import {clsx} from 'clsx';
import type React from 'react';

interface DisplayNameFontDefinition {
	id: DisplayNameFont;
	label: MessageDescriptor | string;
	family: string | null;
	googleQuery: string | null;
}

export const DISPLAY_NAME_FONT_DEFINITIONS: ReadonlyArray<DisplayNameFontDefinition> = [
	{
		id: DisplayNameFonts.DEFAULT,
		label: msg({message: 'Default', comment: 'Display name style font choice that keeps the app font.'}),
		family: null,
		googleQuery: null,
	},
	{id: DisplayNameFonts.BANGERS, label: 'Bangers', family: "'Bangers', cursive", googleQuery: 'Bangers'},
	{id: DisplayNameFonts.BIORHYME, label: 'BioRhyme', family: "'BioRhyme', serif", googleQuery: 'BioRhyme:wght@700'},
	{
		id: DisplayNameFonts.CHERRY_BOMB,
		label: 'Cherry Bomb',
		family: "'Cherry Bomb One', cursive",
		googleQuery: 'Cherry+Bomb+One',
	},
	{id: DisplayNameFonts.CHICLE, label: 'Chicle', family: "'Chicle', cursive", googleQuery: 'Chicle'},
	{
		id: DisplayNameFonts.MUSEO_MODERNO,
		label: 'MuseoModerno',
		family: "'MuseoModerno', sans-serif",
		googleQuery: 'MuseoModerno:wght@700',
	},
	{
		id: DisplayNameFonts.PIXELIFY,
		label: 'Pixelify',
		family: "'Pixelify Sans', monospace",
		googleQuery: 'Pixelify+Sans:wght@600',
	},
	{
		id: DisplayNameFonts.ZILLA_SLAB,
		label: 'Zilla Slab',
		family: "'Zilla Slab', serif",
		googleQuery: 'Zilla+Slab:wght@700',
	},
	{
		id: DisplayNameFonts.ORBITRON,
		label: 'Orbitron',
		family: "'Orbitron', sans-serif",
		googleQuery: 'Orbitron:wght@700',
	},
	{id: DisplayNameFonts.PACIFICO, label: 'Pacifico', family: "'Pacifico', cursive", googleQuery: 'Pacifico'},
	{id: DisplayNameFonts.CREEPSTER, label: 'Creepster', family: "'Creepster', cursive", googleQuery: 'Creepster'},
	{id: DisplayNameFonts.LOBSTER, label: 'Lobster', family: "'Lobster', cursive", googleQuery: 'Lobster'},
	{id: DisplayNameFonts.SILKSCREEN, label: 'Silkscreen', family: "'Silkscreen', monospace", googleQuery: 'Silkscreen'},
];

interface DisplayNameEffectDefinition {
	id: DisplayNameEffect;
	label: MessageDescriptor;
	colorCount: 1 | 2;
}

export const DISPLAY_NAME_EFFECT_DEFINITIONS: ReadonlyArray<DisplayNameEffectDefinition> = [
	{
		id: DisplayNameEffects.SOLID,
		label: msg({message: 'Solid', comment: 'Display name style effect: one flat color.'}),
		colorCount: 1,
	},
	{
		id: DisplayNameEffects.GRADIENT,
		label: msg({message: 'Gradient', comment: 'Display name style effect: a blend from one color to another.'}),
		colorCount: 2,
	},
	{
		id: DisplayNameEffects.NEON,
		label: msg({message: 'Neon', comment: 'Display name style effect: a glowing neon look.'}),
		colorCount: 1,
	},
	{
		id: DisplayNameEffects.TOON,
		label: msg({message: 'Toon', comment: 'Display name style effect: a cartoon look with an outline.'}),
		colorCount: 2,
	},
	{
		id: DisplayNameEffects.POP,
		label: msg({message: 'Pop', comment: 'Display name style effect: text with a hard offset shadow.'}),
		colorCount: 2,
	},
];

const EFFECT_CLASS_NAMES: Record<number, string | undefined> = {
	[DisplayNameEffects.SOLID]: styles.solid,
	[DisplayNameEffects.GRADIENT]: styles.gradient,
	[DisplayNameEffects.NEON]: styles.neon,
	[DisplayNameEffects.TOON]: styles.toon,
	[DisplayNameEffects.POP]: styles.pop,
};

const FONT_STYLESHEET_ID = 'fluxer-display-name-fonts';

function ensureDisplayNameFontsLoaded(): void {
	if (typeof document === 'undefined' || document.getElementById(FONT_STYLESHEET_ID)) return;
	const families = DISPLAY_NAME_FONT_DEFINITIONS.flatMap((font) =>
		font.googleQuery ? [`family=${font.googleQuery}`] : [],
	);
	const link = document.createElement('link');
	link.id = FONT_STYLESHEET_ID;
	link.rel = 'stylesheet';
	link.href = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
	document.head.appendChild(link);
}

export function colorIntToHex(color: number): string {
	return `#${(color & 0xffffff).toString(16).padStart(6, '0')}`;
}

export function getDisplayNameFont(fontId: number): DisplayNameFontDefinition {
	return DISPLAY_NAME_FONT_DEFINITIONS.find((font) => font.id === fontId) ?? DISPLAY_NAME_FONT_DEFINITIONS[0];
}

export function getDisplayNameEffect(effectId: number): DisplayNameEffectDefinition {
	return DISPLAY_NAME_EFFECT_DEFINITIONS.find((effect) => effect.id === effectId) ?? DISPLAY_NAME_EFFECT_DEFINITIONS[0];
}

export function displayNameStylesEqual(
	a: DisplayNameStyles | null | undefined,
	b: DisplayNameStyles | null | undefined,
): boolean {
	if (a == null || b == null) return a == null && b == null;
	return (
		a.font_id === b.font_id &&
		a.effect_id === b.effect_id &&
		a.colors.length === b.colors.length &&
		a.colors.every((color, index) => color === b.colors[index])
	);
}

interface DisplayNameStyleProps {
	className?: string;
	style?: React.CSSProperties;
}

export function getDisplayNameStyleProps(
	nameStyles: DisplayNameStyles | null | undefined,
	options?: {className?: string; fallbackColor?: string},
): DisplayNameStyleProps {
	if (!nameStyles) {
		return {
			className: options?.className,
			style: options?.fallbackColor ? {color: options.fallbackColor} : undefined,
		};
	}
	const font = getDisplayNameFont(nameStyles.font_id);
	if (font.family) ensureDisplayNameFontsLoaded();
	const [first, second] = nameStyles.colors;
	const primary = first != null ? colorIntToHex(first) : options?.fallbackColor;
	const secondary = second != null ? colorIntToHex(second) : primary;
	const style: Record<string, string> = {};
	if (font.family) style.fontFamily = font.family;
	if (primary) style['--display-name-color-1'] = primary;
	if (secondary) style['--display-name-color-2'] = secondary;
	return {
		className: clsx(options?.className, styles.styled, primary && EFFECT_CLASS_NAMES[nameStyles.effect_id]),
		style: style as React.CSSProperties,
	};
}
