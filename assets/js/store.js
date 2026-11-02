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

// 'GitHub · Change is constant' → 'GitHub'; long or empty titles fall back to the domain ('github.com' → 'Github').
const siteName = (title, link) => {
	const short = String(title || '').split(/\s[-|·—–:]\s/)[0].trim();
	if (short && short.length <= 20) return short;
	const host = new URL(link).hostname.replace(/^www\./, '').split('.')[0];
	return host.charAt(0).toUpperCase() + host.slice(1);
};

// First install: most-visited sites become the tiles, bookmarks-bar folders the lists.
// Defaults fill whatever the browser can't, so the page is never emptier than before.
const importedLinks = (topSites, bar, defaults) => {
	const seen = new Set();
	const fresh = (link) => {
		const url = normalizeUrl(link);
		if (!url) return false;
		const host = new URL(url).hostname.replace(/^www\./, '');
		return !seen.has(host) && seen.add(host);
	};
	const tiles = (topSites || [])
		.filter((s) => fresh(s.url))
		.map((s) => ({ name: siteName(s.title, s.url), icon: 'globe', link: s.url }));
	const fill = defaults.tiles.filter((t) => fresh(t.link));
	const want = defaults.tiles.length;

	const nodes = (bar && bar.children) || [];
	const asLinks = (list) =>
		list.filter((n) => n.url && normalizeUrl(n.url)).slice(0, 8).map((n) => ({ name: siteName(n.title, n.url), link: n.url }));
	const lists = nodes
		.filter((n) => !n.url && n.children)
		.map((f) => ({ title: String(f.title || '').trim() || 'Bookmarks', icon: 'folder', links: asLinks(f.children) }));
	const loose = asLinks(nodes);
	if (loose.length) lists.unshift({ title: 'Bookmarks', icon: 'bookmark', links: loose });
	const filled = lists.filter((l) => l.links.length).slice(0, defaults.lists.length);

	return cleanLinks({
		tiles: [...tiles, ...fill].slice(0, want),
		lists: [...filled, ...defaults.lists.slice(filled.length)],
	});
};

// Firefox's bookmarks toolbar is 'toolbar_____', Chrome's bookmarks bar '1'.
const browserLinks = async (defaults) => {
	const [sites, tree] = await Promise.all([
		ext.topSites ? ext.topSites.get().catch(() => []) : [],
		ext.bookmarks ? ext.bookmarks.getTree().catch(() => []) : [],
	]);
	const bar = ((tree[0] && tree[0].children) || []).find((n) => n.id === 'toolbar_____' || n.id === '1');
	const links = importedLinks(sites, bar, defaults);
	// 'Work' → briefcase, 'Dev' → code; guessIcons lives in editor.js, loaded by the time this runs.
	for (const l of links.lists) if (l.icon === 'folder') l.icon = guessIcons(l.title)[0] || 'folder';
	return links;
};

// True after loadLinks built the links from the browser, so the page can say so once.
let justImported = false;

const loadLinks = async () => {
	const defaults = defaultLinks();
	try {
		const saved = syncStorage
			? await syncStorage.get(['tiles', 'lists'])
			: JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
		if (!saved.tiles && !saved.lists && syncStorage) {
			// Kept on this device only: on a second device Sync may not have delivered the real
			// links yet, and they must win. Cached so tiles don't reshuffle as browsing changes.
			const local = await ext.storage.local.get('imported');
			if (local.imported) return cleanLinks(local.imported);
			const imported = await browserLinks(defaults);
			await ext.storage.local.set({ imported });
			justImported = true;
			return imported;
		}
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
	syncStorage ? Promise.all([syncStorage.remove(['tiles', 'lists']), ext.storage.local.remove('imported')]) :Promise.resolve(localStorage.removeItem(LOCAL_KEY));

// Another device (via Sync) or another tab changed the links.
const onLinksChanged = (fn) => {
	if (syncStorage) ext.storage.onChanged.addListener((c, area) => area === 'sync' && (c.tiles || c.lists) && fn());
	else window.addEventListener('storage', (e) => e.key === LOCAL_KEY && fn());
};
