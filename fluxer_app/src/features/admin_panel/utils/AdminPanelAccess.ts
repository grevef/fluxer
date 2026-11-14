// SPDX-License-Identifier: AGPL-3.0-or-later

import type {User} from '@app/features/user/models/User';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';

// Mirrors the admin sign-in check: admin:authenticate, or the wildcard ACL that grants everything.
export function canAccessAdminPanel(user: User | null | undefined): boolean {
	if (!user) return false;
	return user.hasAcl(AdminACLs.AUTHENTICATE) || user.hasAcl(AdminACLs.WILDCARD);
}
