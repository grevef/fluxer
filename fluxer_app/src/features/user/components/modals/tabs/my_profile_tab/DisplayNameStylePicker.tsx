// SPDX-License-Identifier: AGPL-3.0-or-later

import {LimitResolver} from '@app/features/app/utils/LimitResolverAdapter';
import {Button} from '@app/features/ui/button/Button';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import {ColorPickerField} from '@app/features/ui/components/form/ColorPickerField';
import * as UserCommands from '@app/features/user/commands/UserCommands';
import myProfileTabStyles from '@app/features/user/components/modals/tabs/MyProfileTab.module.css';
import styles from '@app/features/user/components/modals/tabs/my_profile_tab/DisplayNameStylePicker.module.css';
import type {User} from '@app/features/user/models/User';
import {
	DISPLAY_NAME_EFFECT_DEFINITIONS,
	DISPLAY_NAME_FONT_DEFINITIONS,
	displayNameStylesEqual,
	getDisplayNameEffect,
	getDisplayNameStyleProps,
} from '@app/features/user/utils/DisplayNameStyleUtils';
import {
	DisplayNameEffects,
	DisplayNameFonts,
	type DisplayNameStyles,
} from '@fluxer/constants/src/DisplayNameStyleConstants';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import {useEffect, useState} from 'react';

const DEFAULT_COLORS: [number, number] = [0x5865f2, 0xeb459e];

const DISPLAY_NAME_STYLE_DESCRIPTOR = msg({
	message: 'Display name style',
	comment: 'Heading of the profile setting that picks a font, effect and colors for the display name.',
});
const DISPLAY_NAME_STYLE_DESCRIPTION_DESCRIPTOR = msg({
	message: 'Pick a font, an effect and colors for your name in chat, the member list and your profile.',
	comment: 'Description under the display name style heading in profile settings.',
});
const DISPLAY_NAME_STYLE_PREMIUM_DESCRIPTOR = msg({
	message: 'Display name styles are a premium perk.',
	comment: 'Notice shown on the display name style picker when the user does not have premium.',
});
const FONT_DESCRIPTOR = msg({message: 'Font', comment: 'Label for the display name font choices.'});
const EFFECT_DESCRIPTOR = msg({message: 'Effect', comment: 'Label for the display name effect choices.'});
const COLOR_DESCRIPTOR = msg({
	message: 'Color',
	comment: 'Label for the display name style color when the chosen effect uses a single color.',
});
const PRIMARY_COLOR_DESCRIPTOR = msg({
	message: 'Primary color',
	comment: 'Label for the first display name style color when the chosen effect also uses a secondary color.',
});
const SECONDARY_COLOR_DESCRIPTOR = msg({
	message: 'Secondary color',
	comment: 'Label for the second display name style color, used by gradient, toon and pop effects.',
});
const SAVE_STYLE_DESCRIPTOR = msg({message: 'Save style', comment: 'Button that saves the display name style.'});
const REMOVE_STYLE_DESCRIPTOR = msg({
	message: 'Remove style',
	comment: 'Button that clears the display name style back to the plain name.',
});
const STYLE_SAVED_DESCRIPTOR = msg({
	message: 'Display name style saved',
	comment: 'Toast shown after the display name style is saved.',
});
const STYLE_SAVE_FAILED_DESCRIPTOR = msg({
	message: 'Could not save your display name style',
	comment: 'Toast shown when saving the display name style fails.',
});

interface DisplayNameStylePickerProps {
	user: User;
	previewName: string;
	disabled?: boolean;
}

export const DisplayNameStylePicker = observer(({user, previewName, disabled}: DisplayNameStylePickerProps) => {
	const {i18n} = useLingui();
	const saved = user.displayNameStyles;
	const [draft, setDraft] = useState<DisplayNameStyles | null>(saved);
	const [submitting, setSubmitting] = useState(false);
	useEffect(() => setDraft(saved), [saved]);
	const hasEntitlement = LimitResolver.resolve({key: 'feature_display_name_styles', fallback: 0}) > 0;
	const locked = disabled || !hasEntitlement;
	const current: DisplayNameStyles = draft ?? {
		font_id: DisplayNameFonts.DEFAULT,
		effect_id: DisplayNameEffects.SOLID,
		colors: [DEFAULT_COLORS[0]],
	};
	const colorCount = getDisplayNameEffect(current.effect_id).colorCount;
	const update = (patch: Partial<DisplayNameStyles>) => {
		const next = {...current, ...patch};
		const needed = getDisplayNameEffect(next.effect_id).colorCount;
		const colors = [next.colors[0] ?? DEFAULT_COLORS[0], next.colors[1] ?? DEFAULT_COLORS[1]].slice(0, needed);
		setDraft({...next, colors});
	};
	const setColor = (index: 0 | 1, value: number | null) => {
		const colors = [...current.colors];
		colors[index] = value ?? DEFAULT_COLORS[index];
		update({colors});
	};
	const save = async (styles: DisplayNameStyles | null) => {
		setSubmitting(true);
		try {
			await UserCommands.update({display_name_styles: styles});
			ToastCommands.createToast({type: 'success', children: i18n._(STYLE_SAVED_DESCRIPTOR)});
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(STYLE_SAVE_FAILED_DESCRIPTOR)});
		} finally {
			setSubmitting(false);
		}
	};
	const isDirty = !displayNameStylesEqual(draft, saved);
	return (
		<div
			className={clsx(styles.container, locked && styles.locked)}
			data-flx="user.my-profile-tab.display-name-style-picker.container"
		>
			<div className={styles.header} data-flx="user.my-profile-tab.display-name-style-picker.header">
				<span className={styles.title} data-flx="user.my-profile-tab.display-name-style-picker.title">
					{i18n._(DISPLAY_NAME_STYLE_DESCRIPTOR)}
				</span>
				<p
					className={myProfileTabStyles.inputFooter}
					data-flx="user.my-profile-tab.display-name-style-picker.description"
				>
					{i18n._(hasEntitlement ? DISPLAY_NAME_STYLE_DESCRIPTION_DESCRIPTOR : DISPLAY_NAME_STYLE_PREMIUM_DESCRIPTOR)}
				</p>
			</div>
			<div className={styles.preview} data-flx="user.my-profile-tab.display-name-style-picker.preview">
				<span
					{...getDisplayNameStyleProps(draft, {className: styles.previewName})}
					data-flx="user.my-profile-tab.display-name-style-picker.preview-name"
				>
					{previewName}
				</span>
			</div>
			<span className={styles.label} data-flx="user.my-profile-tab.display-name-style-picker.font-label">
				{i18n._(FONT_DESCRIPTOR)}
			</span>
			<div className={styles.grid} data-flx="user.my-profile-tab.display-name-style-picker.font-grid">
				{DISPLAY_NAME_FONT_DEFINITIONS.map((font) => (
					<button
						key={font.id}
						type="button"
						disabled={locked}
						aria-pressed={draft !== null && current.font_id === font.id}
						className={clsx(styles.tile, draft !== null && current.font_id === font.id && styles.tileSelected)}
						onClick={() => update({font_id: font.id})}
						data-flx="user.my-profile-tab.display-name-style-picker.font-tile"
					>
						<span
							{...getDisplayNameStyleProps({font_id: font.id, effect_id: DisplayNameEffects.SOLID, colors: []})}
							data-flx="user.my-profile-tab.display-name-style-picker.font-sample"
						>
							{typeof font.label === 'string' ? font.label : i18n._(font.label)}
						</span>
					</button>
				))}
			</div>
			<span className={styles.label} data-flx="user.my-profile-tab.display-name-style-picker.effect-label">
				{i18n._(EFFECT_DESCRIPTOR)}
			</span>
			<div className={styles.grid} data-flx="user.my-profile-tab.display-name-style-picker.effect-grid">
				{DISPLAY_NAME_EFFECT_DEFINITIONS.map((effect) => (
					<button
						key={effect.id}
						type="button"
						disabled={locked}
						aria-pressed={draft !== null && current.effect_id === effect.id}
						className={clsx(styles.tile, draft !== null && current.effect_id === effect.id && styles.tileSelected)}
						onClick={() => update({effect_id: effect.id})}
						data-flx="user.my-profile-tab.display-name-style-picker.effect-tile"
					>
						<span
							{...getDisplayNameStyleProps({...current, effect_id: effect.id, colors: [...DEFAULT_COLORS]})}
							data-flx="user.my-profile-tab.display-name-style-picker.effect-sample"
						>
							{i18n._(effect.label)}
						</span>
					</button>
				))}
			</div>
			<div className={styles.colors} data-flx="user.my-profile-tab.display-name-style-picker.colors">
				<ColorPickerField
					label={i18n._(colorCount === 2 ? PRIMARY_COLOR_DESCRIPTOR : COLOR_DESCRIPTOR)}
					value={current.colors[0] ?? DEFAULT_COLORS[0]}
					onChange={(value: number | null) => setColor(0, value)}
					defaultValue={DEFAULT_COLORS[0]}
					disabled={locked}
					data-flx="user.my-profile-tab.display-name-style-picker.primary-color"
				/>
				{colorCount === 2 && (
					<ColorPickerField
						label={i18n._(SECONDARY_COLOR_DESCRIPTOR)}
						value={current.colors[1] ?? DEFAULT_COLORS[1]}
						onChange={(value: number | null) => setColor(1, value)}
						defaultValue={DEFAULT_COLORS[1]}
						disabled={locked}
						data-flx="user.my-profile-tab.display-name-style-picker.secondary-color"
					/>
				)}
			</div>
			<div className={styles.actions} data-flx="user.my-profile-tab.display-name-style-picker.actions">
				{saved !== null && (
					<Button
						variant="secondary"
						small={true}
						disabled={submitting}
						onClick={() => void save(null)}
						data-flx="user.my-profile-tab.display-name-style-picker.remove"
					>
						{i18n._(REMOVE_STYLE_DESCRIPTOR)}
					</Button>
				)}
				<Button
					small={true}
					disabled={locked || !isDirty || draft === null}
					submitting={submitting}
					onClick={() => void save(draft)}
					data-flx="user.my-profile-tab.display-name-style-picker.save"
				>
					{i18n._(SAVE_STYLE_DESCRIPTOR)}
				</Button>
			</div>
		</div>
	);
});
