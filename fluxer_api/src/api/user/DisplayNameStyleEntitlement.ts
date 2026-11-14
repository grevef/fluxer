// SPDX-License-Identifier: AGPL-3.0-or-later

import {getGlobalLimitConfigSnapshot} from '@app/api/limits/LimitConfigService';
import {resolveLimitSafe} from '@app/api/limits/LimitConfigUtils';
import {createLimitMatchContext} from '@app/api/limits/LimitMatchContextBuilder';
import type {User} from '@app/api/models/User';

export function userHasDisplayNameStylesEntitlement(user: User): boolean {
	if (user.isBot) return true;
	const ctx = createLimitMatchContext({user});
	return resolveLimitSafe(getGlobalLimitConfigSnapshot(), ctx, 'feature_display_name_styles', 0) > 0;
}
