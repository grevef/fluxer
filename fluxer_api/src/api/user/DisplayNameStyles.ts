// SPDX-License-Identifier: AGPL-3.0-or-later

import type {UserRow} from '@app/api/database/types/UserTypes';
import type {DisplayNameStyles} from '@fluxer/constants/src/DisplayNameStyleConstants';

type DisplayNameStyleColumns = Pick<UserRow, 'display_name_font_id' | 'display_name_effect_id' | 'display_name_colors'>;

export function displayNameStylesFromRow(row: DisplayNameStyleColumns): DisplayNameStyles | null {
	if (row.display_name_font_id == null) return null;
	return {
		font_id: row.display_name_font_id,
		effect_id: row.display_name_effect_id ?? 0,
		colors: row.display_name_colors ? [...row.display_name_colors] : [],
	};
}

export function displayNameStylesToRow(styles: DisplayNameStyles | null): Required<DisplayNameStyleColumns> {
	return {
		display_name_font_id: styles?.font_id ?? null,
		display_name_effect_id: styles?.effect_id ?? null,
		display_name_colors: styles && styles.colors.length > 0 ? [...styles.colors] : null,
	};
}

export function displayNameStylesEqual(a: DisplayNameStyles | null, b: DisplayNameStyles | null): boolean {
	if (a === null || b === null) return a === b;
	return (
		a.font_id === b.font_id &&
		a.effect_id === b.effect_id &&
		a.colors.length === b.colors.length &&
		a.colors.every((color, index) => color === b.colors[index])
	);
}
