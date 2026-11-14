// SPDX-License-Identifier: AGPL-3.0-or-later

import {openExternalDeduped} from '@electron/main/OpenExternal';
import {requirePrivilegedRendererDocumentSender} from '@electron/main/PrivilegedRendererDocuments';
import {isObjectLike as isRecord} from '@fluxer/record_utils/src/RecordGuards';
import {BrowserWindow, ipcMain, WebContentsView} from 'electron';
import log from 'electron-log';

export const ADMIN_PANEL_VIEW_SHOW_CHANNEL = 'admin-panel-view:show';
export const ADMIN_PANEL_VIEW_HIDE_CHANNEL = 'admin-panel-view:hide';

interface AdminPanelBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface AdminPanelViewState {
	view: WebContentsView;
	window: BrowserWindow;
	origin: string;
}

let state: AdminPanelViewState | null = null;

function parseBounds(value: unknown): AdminPanelBounds | null {
	if (!isRecord(value)) return null;
	const {x, y, width, height} = value as Record<string, unknown>;
	if (![x, y, width, height].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
	return {x: x as number, y: y as number, width: Math.max(0, width as number), height: Math.max(0, height as number)};
}

function parseAdminUrl(value: unknown): URL | null {
	if (typeof value !== 'string') return null;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
	} catch {
		return null;
	}
}

function scaleBounds(bounds: AdminPanelBounds, zoomFactor: number): Electron.Rectangle {
	return {
		x: Math.round(bounds.x * zoomFactor),
		y: Math.round(bounds.y * zoomFactor),
		width: Math.round(bounds.width * zoomFactor),
		height: Math.round(bounds.height * zoomFactor),
	};
}

function destroyAdminPanelView(): void {
	if (!state) return;
	const {view, window} = state;
	state = null;
	if (!window.isDestroyed()) {
		window.contentView.removeChildView(view);
	}
	if (!view.webContents.isDestroyed()) {
		view.webContents.close();
	}
}

function createAdminPanelView(window: BrowserWindow, url: URL): AdminPanelViewState {
	const view = new WebContentsView({
		webPreferences: {
			sandbox: true,
			contextIsolation: true,
			nodeIntegration: false,
			webviewTag: false,
		},
	});
	const origin = url.origin;
	// The view is a sandboxed browser with no preload, so it may follow the admin login through the
	// instance's OAuth pages; only new windows leave it.
	view.webContents.setWindowOpenHandler(({url: target}) => {
		if (parseAdminUrl(target)) void openExternalDeduped(target);
		return {action: 'deny'};
	});
	window.on('closed', () => {
		if (state?.window === window) state = null;
	});
	window.contentView.addChildView(view);
	void view.webContents.loadURL(url.toString()).catch((error: unknown) => {
		log.warn('[AdminPanelView] Failed to load admin panel', error);
	});
	return {view, window, origin};
}

export function registerAdminPanelViewIpcHandlers(): void {
	ipcMain.handle(ADMIN_PANEL_VIEW_SHOW_CHANNEL, (event, request: unknown) => {
		requirePrivilegedRendererDocumentSender(event, ADMIN_PANEL_VIEW_SHOW_CHANNEL);
		const window = BrowserWindow.fromWebContents(event.sender);
		if (!window || window.isDestroyed() || !isRecord(request)) return false;
		const {url: rawUrl, bounds: rawBounds} = request as Record<string, unknown>;
		const url = parseAdminUrl(rawUrl);
		const bounds = parseBounds(rawBounds);
		if (!url || !bounds) return false;
		if (state && (state.window !== window || state.origin !== url.origin)) {
			destroyAdminPanelView();
		}
		if (!state) {
			state = createAdminPanelView(window, url);
		}
		state.view.setBounds(scaleBounds(bounds, event.sender.getZoomFactor()));
		state.view.setVisible(true);
		return true;
	});
	ipcMain.handle(ADMIN_PANEL_VIEW_HIDE_CHANNEL, (event) => {
		requirePrivilegedRendererDocumentSender(event, ADMIN_PANEL_VIEW_HIDE_CHANNEL);
		state?.view.setVisible(false);
	});
}
