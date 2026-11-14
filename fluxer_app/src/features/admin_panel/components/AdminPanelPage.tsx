// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/admin_panel/components/AdminPanelPage.module.css';
import {canAccessAdminPanel} from '@app/features/admin_panel/utils/AdminPanelAccess';
import RuntimeConfig from '@app/features/app/state/RuntimeConfig';
import {getElectronAPI, openExternalUrl} from '@app/features/ui/utils/NativeUtils';
import Users from '@app/features/user/state/Users';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {ArrowSquareOutIcon, ShieldStarIcon} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import {useLayoutEffect, useRef} from 'react';

const ADMIN_PANEL_DESCRIPTOR = msg({message: 'Admin panel', comment: 'Title of the in-app admin panel page.'});
const OPEN_IN_BROWSER_DESCRIPTOR = msg({
	message: 'Open in browser',
	comment: 'Button on the in-app admin panel page that opens the admin panel in the system browser.',
});
const NO_ACCESS_DESCRIPTOR = msg({
	message: 'Your account does not have access to the admin panel.',
	comment: 'Shown on the in-app admin panel page when the user lacks admin access.',
});

export const AdminPanelPage = observer(() => {
	const {i18n} = useLingui();
	const frameRef = useRef<HTMLDivElement>(null);
	const adminUrl = RuntimeConfig.adminEndpoint;
	const hasAccess = canAccessAdminPanel(Users.getCurrentUser());
	const electronApi = getElectronAPI();
	const showNativeView = electronApi?.showAdminPanelView;
	const hideNativeView = electronApi?.hideAdminPanelView;
	const useNativeView = hasAccess && showNativeView != null;

	// On desktop the admin panel runs in a native view laid over this placeholder, so its login
	// cookie stays first-party; the placeholder only reports where that view belongs.
	useLayoutEffect(() => {
		const element = frameRef.current;
		if (!useNativeView || !showNativeView || !element) return;
		let frame = 0;
		const sync = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const rect = element.getBoundingClientRect();
				void showNativeView({
					url: adminUrl,
					bounds: {x: rect.left, y: rect.top, width: rect.width, height: rect.height},
				});
			});
		};
		sync();
		const observer = new ResizeObserver(sync);
		observer.observe(element);
		window.addEventListener('resize', sync);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener('resize', sync);
			void hideNativeView?.();
		};
	}, [adminUrl, useNativeView, showNativeView, hideNativeView]);

	return (
		<div className={styles.page} data-flx="admin-panel.admin-panel-page.page">
			<div className={styles.header} data-flx="admin-panel.admin-panel-page.header">
				<ShieldStarIcon
					weight="fill"
					className={styles.headerIcon}
					data-flx="admin-panel.admin-panel-page.header-icon"
				/>
				<span className={styles.title} data-flx="admin-panel.admin-panel-page.title">
					{i18n._(ADMIN_PANEL_DESCRIPTOR)}
				</span>
				<button
					type="button"
					className={styles.headerButton}
					onClick={() => void openExternalUrl(adminUrl)}
					data-flx="admin-panel.admin-panel-page.open-in-browser"
				>
					<ArrowSquareOutIcon weight="bold" data-flx="admin-panel.admin-panel-page.open-in-browser-icon" />
					<span data-flx="admin-panel.admin-panel-page.open-in-browser-label">
						{i18n._(OPEN_IN_BROWSER_DESCRIPTOR)}
					</span>
				</button>
			</div>
			<div ref={frameRef} className={styles.frameArea} data-flx="admin-panel.admin-panel-page.frame-area">
				{!hasAccess && (
					<p className={styles.notice} data-flx="admin-panel.admin-panel-page.no-access">
						{i18n._(NO_ACCESS_DESCRIPTOR)}
					</p>
				)}
				{hasAccess && !useNativeView && (
					<iframe
						src={adminUrl}
						title={i18n._(ADMIN_PANEL_DESCRIPTOR)}
						className={styles.frame}
						data-flx="admin-panel.admin-panel-page.frame"
					/>
				)}
			</div>
		</div>
	);
});
