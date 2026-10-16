// ┌─┐┌┬┐┌─┐┬─┐┌─┐
// └─┐ │ │ │├┬┘├┤
// └─┘ ┴ └─┘┴└─└─┘
// Your pinned sites and lists. CONFIG only seeds them; edits are saved to
// Firefox Sync storage (or localStorage when Tiffin runs as a plain web page).

const LOCAL_KEY = 'tiffin-links';
// Firefox exposes `browser`, Chrome and Edge `chrome`; both return promises in MV3. The later scripts use it too.
const ext = globalThis.browser ?? globalThis.chrome;
const syncStorage = ext && ext.storage && ext.storage.sync;

// 'github.com' → 'https://github.com/'. Anything that isn't http(s) → '' (blocks javascript: links).
const normalizeUrl = (value) => {
	const v = String(value || '').trim();
	if (!v) return '';
	try {
		const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
		return /^https?:$/.test(url.protocol) ? url.href : '';
	} catch (e) {
		return '';
	}
};

// Keeps only well-formed entries, so a bad import or corrupted sync can't break the page.
const cleanLinks = (data) => {
	const arr = (x) => (Array.isArray(x) ? x : []);
	return {
		tiles: arr(data && data.tiles)
			.map((t) => ({ name: String(t.name || '').trim(), icon: String(t.icon || 'link'), link: normalizeUrl(t.link) }))
			.filter((t) => t.name && t.link),
		lists: arr(data && data.lists).map((l) => ({
			title: String(l.title || '').trim(),
			icon: String(l.icon || 'list'),
			links: arr(l.links)
				.map((i) => ({ name: String(i.name || '').trim(), link: normalizeUrl(i.link) }))
				.filter((i) => i.name && i.link),
		})),
	};
};

const defaultLinks = () => {
	const bento = !['lists', 'buttons'].includes(CONFIG.bentoLayout);
	const pick = (first, second) => [...(first || []), ...(bento ? [] : second || [])];
	return cleanLinks({
		tiles: pick(CONFIG.firstButtonsContainer, CONFIG.secondButtonsContainer),
		lists: pick(CONFIG.firstlistsContainer, CONFIG.secondListsContainer),
	});
};

const loadLinks = async () => {
	const defaults = defaultLinks();
	try {
		const saved = syncStorage
			? await syncStorage.get(['tiles', 'lists'])
			: JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
		const clean = cleanLinks(saved);
		return { tiles: saved.tiles ? clean.tiles : defaults.tiles, lists: saved.lists ? clean.lists : defaults.lists };
	} catch (e) {
		return defaults;
	}
};

// shortcut: sync allows ~8 KB per key (roughly 80 lists' worth of links); the error is shown if it's ever hit.
const saveLinks = (links) =>
	syncStorage ? syncStorage.set(links) : Promise.resolve(localStorage.setItem(LOCAL_KEY, JSON.stringify(links)));

const resetLinks = () =>
	syncStorage ? syncStorage.remove(['tiles', 'lists']) : Promise.resolve(localStorage.removeItem(LOCAL_KEY));

// Another device (via Sync) or another tab changed the links.
const onLinksChanged = (fn) => {
	if (syncStorage) ext.storage.onChanged.addListener((c, area) => area === 'sync' && (c.tiles || c.lists) && fn());
	else window.addEventListener('storage', (e) => e.key === LOCAL_KEY && fn());
};
