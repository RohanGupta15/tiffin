// ┌─┐┌─┐┌─┐┬─┐┌─┐┬ ┬
// └─┐├┤ ├─┤├┬┘│  ├─┤
// └─┘└─┘┴ ┴┴└─└─┘┴ ┴
// Search box that jumps to your links, opens typed addresses, or searches the web
// with Firefox's default engine. Also owns the page's keyboard shortcuts.

const search = document.getElementById('search');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchKey = document.getElementById('searchKey');

let results = [];
let active = 0;

const isSubsequence = (needle, haystack) => {
	let i = 0;
	for (const c of haystack) if (c === needle[i]) i++;
	return i === needle.length;
};

const scoreLink = (q, link) => {
	const name = link.name.toLowerCase();
	if (name.startsWith(q)) return 0;
	if (name.includes(q)) return 1;
	if (domainOf(link.link).includes(q)) return 2;
	if (isSubsequence(q, name)) return 3;
	return null;
};

const looksLikeAddress = (q) => /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(q);

const webSearch = (text) => {
	if (typeof browser !== 'undefined' && browser.search && browser.search.query) {
		browser.search.query({ text, disposition: CONFIG.openInNewTab ? 'NEW_TAB' : 'CURRENT_TAB' });
	} else {
		openLink(CONFIG.searchUrl.replace('%s', encodeURIComponent(text)));
	}
};

const buildResults = (query) => {
	const q = query.trim().toLowerCase();
	if (!q) return [];

	const matches = ALL_LINKS.map((link) => ({ link, score: scoreLink(q, link) }))
		.filter((m) => m.score !== null)
		.sort((a, b) => a.score - b.score)
		.slice(0, 5)
		.map(({ link }) => ({
			kind: 'link',
			label: link.name,
			detail: [link.group, domainOf(link.link)].filter(Boolean).join(' · '),
			icon: link.icon,
			key: link.key,
			run: () => openLink(link.link),
		}));

	const typed = query.trim();
	if (looksLikeAddress(typed)) {
		const url = /^https?:\/\//i.test(typed) ? typed : `https://${typed}`;
		matches.unshift({ kind: 'address', label: `Go to ${typed}`, detail: '', icon: 'arrow-up-right', run: () => openLink(url) });
	}

	matches.push({
		kind: 'web',
		label: 'Search the web for',
		query: typed,
		detail: '',
		icon: 'globe',
		run: () => webSearch(typed),
	});
	return matches;
};

const renderResults = () => {
	const open = results.length > 0;
	search.classList.toggle('is-open', open);
	searchResults.hidden = !open;
	searchInput.setAttribute('aria-expanded', String(open));
	searchKey.textContent = searchInput.value ? 'esc' : '/';

	searchResults.replaceChildren(
		...results.map((r, i) => {
			const isActive = i === active;
			const badge = r.kind === 'link' && !r.icon ? r.label.charAt(0) : icon(r.icon || 'link', 14, 1.75);
			return h(
				'div',
				{
					class: `result${isActive ? ' is-active' : ''}`,
					id: `result-${i}`,
					role: 'option',
					'aria-selected': String(isActive),
					onmousemove: () => {
						if (active !== i) {
							active = i;
							renderResults();
						}
					},
					onclick: r.run,
				},
				h('span', { class: 'result__initial' }, badge),
				h(
					'span',
					{ class: 'result__name' },
					r.label,
					r.kind === 'web' && h('em', {}, ` “${r.query}”`)
				),
				h('span', { class: 'result__domain' }, r.detail),
				h('span', { class: 'result__hint' }, isActive ? '↵ open' : r.key || '')
			);
		})
	);
	searchInput.setAttribute('aria-activedescendant', open ? `result-${active}` : '');
};

const updateSearch = () => {
	results = buildResults(searchInput.value);
	active = 0;
	renderResults();
};

const clearSearch = () => {
	searchInput.value = '';
	updateSearch();
};

searchInput.addEventListener('input', updateSearch);

searchInput.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowDown' && results.length) {
		e.preventDefault();
		active = (active + 1) % results.length;
		renderResults();
	} else if (e.key === 'ArrowUp' && results.length) {
		e.preventDefault();
		active = (active - 1 + results.length) % results.length;
		renderResults();
	} else if (e.key === 'Enter' && results.length) {
		e.preventDefault();
		results[active].run();
	} else if (e.key === 'Escape') {
		if (searchInput.value) clearSearch();
		else searchInput.blur();
	}
});

// Keep the dropdown open while clicking a result (blur would close it first).
searchResults.addEventListener('mousedown', (e) => e.preventDefault());
searchInput.addEventListener('blur', () => {
	results = [];
	renderResults();
});
searchInput.addEventListener('focus', updateSearch);

document.getElementById('searchIcon').append(icon('search', 18, 1.75));

// Page shortcuts: / search, 1–9 pinned tiles, T theme.
document.addEventListener('keydown', (e) => {
	if (e.target === searchInput || e.ctrlKey || e.metaKey || e.altKey) return;
	if (e.target instanceof HTMLElement && e.target.isContentEditable) return;

	if (e.key === '/') {
		e.preventDefault();
		searchInput.focus();
	} else if (/^[1-9]$/.test(e.key) && PINNED[Number(e.key) - 1]) {
		openLink(PINNED[Number(e.key) - 1].link);
	} else if (e.key === 't' || e.key === 'T') {
		toggleTheme();
	}
});
