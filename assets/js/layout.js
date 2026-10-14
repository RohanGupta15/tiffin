// ┬  ┌─┐┬ ┬┌─┐┬ ┬┌┬┐
// │  ├─┤└┬┘│ ││ │ │
// ┴─┘┴ ┴ ┴ └─┘└─┘ ┴
// Builds the tiles and lists from your saved links, collects every link for
// search, and handles edit mode (E): click or Enter to edit, drag or Alt+arrows
// to reorder. Arrow keys move focus across tiles and lists by screen position.

const PINNED = []; // tiles, in order: keys 1–9 open them
const ALL_LINKS = []; // everything search can jump to

let LINKS = { tiles: [], lists: [] };
let editing = false;
let firstRender = true;
let dragging = null;
let focusAfterRender = null; // data-nav of the element to refocus once the DOM is rebuilt

const linksEl = document.getElementById('links');
const liveEl = document.getElementById('live');
const toastEl = document.getElementById('toast');

const announce = (text) => (liveEl.textContent = text);

const commit = () => {
	saveLinks(LINKS).catch((e) => alert(`Tiffin couldn't save your links: ${e.message}`));
	render();
};

// ┬ ┬┌┐┌┌┬┐┌─┐
// │ ││││ │││ │
// └─┘┘└┘─┴┘└─┘

let undoFn = null;
let toastTimer;

const hideToast = () => {
	toastEl.hidden = true;
	undoFn = null;
};

const undo = () => {
	if (!undoFn) return;
	const fn = undoFn;
	hideToast();
	fn();
	announce('Restored');
};

// Deletes right away and offers Undo (button or Ctrl+Z) for a few seconds.
const removeWithUndo = (label, fn) => {
	const before = structuredClone(LINKS);
	fn();
	commit();
	undoFn = () => {
		LINKS = before;
		commit();
	};
	toastEl.replaceChildren(
		h('span', {}, `Deleted ${label}`),
		h('button', { type: 'button', class: 'toast__undo', onclick: undo }, 'Undo'),
		h('kbd', {}, 'Ctrl Z')
	);
	toastEl.hidden = false;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(hideToast, 6000);
};

// ┌─┐┌┬┐┬┌┬┐┬┌┐┌┌─┐
// ├┤  │││ │ │││││ ┬
// └─┘─┴┘┴ ┴ ┴┘└┘└─┘

// Drag one entry of `list` onto another entry of the same list to move it there.
const sortable = (el, list, i) => {
	if (!editing) return;
	el.draggable = true;
	el.addEventListener('dragstart', (e) => {
		e.stopPropagation();
		dragging = { list, i };
		e.dataTransfer.effectAllowed = 'move';
		requestAnimationFrame(() => el.classList.add('is-dragging'));
	});
	el.addEventListener('dragend', () => el.classList.remove('is-dragging'));
	el.addEventListener('dragover', (e) => {
		if (dragging && dragging.list === list) e.preventDefault();
	});
	el.addEventListener('drop', (e) => {
		if (!dragging || dragging.list !== list) return;
		e.preventDefault();
		e.stopPropagation();
		list.splice(i, 0, ...list.splice(dragging.i, 1));
		dragging = null;
		commit();
	});
};

// In edit mode a click (or Enter, or Ctrl+click) edits instead of following the link.
const editClick = (fn) => (e) => {
	if (!editing) return;
	e.preventDefault();
	e.stopPropagation();
	fn();
};

const moveTo = (list, from, position) => {
	const to = Math.min(Math.max(Number(position) || from + 1, 1), list.length) - 1;
	list.splice(to, 0, ...list.splice(from, 1));
};

const addButton = (label, cls, nav, onclick) =>
	h('button', { class: `add ${cls}`, type: 'button', 'data-nav': nav, onclick }, icon('plus', 16, 1.75), h('span', {}, label));

const editTile = (i) => {
	const isNew = i < 0;
	const tile = isNew ? { name: '', link: '', icon: 'link' } : LINKS.tiles[i];
	openEditor({
		heading: isNew ? 'Add a pinned site' : `Edit ${tile.name}`,
		fields: [
			{ key: 'name', label: 'Name', required: true },
			{ key: 'link', label: 'Address', kind: 'url' },
			{ key: 'icon', label: 'Icon', kind: 'icon' },
			!isNew && { key: 'position', label: 'Position', type: 'number', max: LINKS.tiles.length },
		],
		values: { ...tile, position: i + 1 },
		onSave: ({ name, link, icon, position }) => {
			const next = { name, link: normalizeUrl(link), icon: icon || 'link' };
			if (isNew) LINKS.tiles.push(next);
			else {
				LINKS.tiles[i] = next;
				moveTo(LINKS.tiles, i, position);
			}
			commit();
		},
		onDelete: !isNew && (() => removeWithUndo(tile.name, () => LINKS.tiles.splice(i, 1))),
	});
};

const editList = (i) => {
	const isNew = i < 0;
	const list = isNew ? { title: '', icon: 'list', links: [] } : LINKS.lists[i];
	openEditor({
		heading: isNew ? 'Add a list' : `Edit ${list.title || 'list'}`,
		fields: [
			{ key: 'title', label: 'Heading', required: true },
			{ key: 'icon', label: 'Icon', kind: 'icon' },
			!isNew && { key: 'position', label: 'Position', type: 'number', max: LINKS.lists.length },
		],
		values: { ...list, position: i + 1 },
		onSave: ({ title, icon, position }) => {
			if (isNew) LINKS.lists.push({ title, icon: icon || 'list', links: [] });
			else {
				Object.assign(list, { title, icon: icon || 'list' });
				moveTo(LINKS.lists, i, position);
			}
			commit();
		},
		onDelete: !isNew && (() => removeWithUndo(list.title, () => LINKS.lists.splice(i, 1))),
	});
};

const editItem = (list, j) => {
	const isNew = j < 0;
	const item = isNew ? { name: '', link: '' } : list.links[j];
	openEditor({
		heading: isNew ? `Add to ${list.title}` : `Edit ${item.name}`,
		fields: [
			{ key: 'name', label: 'Name', required: true },
			{ key: 'link', label: 'Address', kind: 'url' },
			!isNew && { key: 'position', label: 'Position', type: 'number', max: list.links.length },
		],
		values: { ...item, position: j + 1 },
		onSave: ({ name, link, position }) => {
			const next = { name, link: normalizeUrl(link) };
			if (isNew) list.links.push(next);
			else {
				list.links[j] = next;
				moveTo(list.links, j, position);
			}
			commit();
		},
		onDelete: !isNew && (() => removeWithUndo(item.name, () => list.links.splice(j, 1))),
	});
};

// ┬─┐┌─┐┌┐┌┌┬┐┌─┐┬─┐
// ├┬┘├┤ │││ ││├┤ ├┬┘
// ┴└─└─┘┘└┘─┴┘└─┘┴└─

const rise = (i) => (firstRender ? { class: 'rise', style: `--i: ${i}` } : {});

const renderTiles = (tiles) =>
	h(
		'nav',
		{ class: 'links__group links__group--tiles', 'aria-label': 'Pinned' },
		tiles.map((button, i) => {
			PINNED.push(button);
			const n = PINNED.length;
			const key = n <= 9 ? String(n) : '';
			ALL_LINKS.push({ name: button.name, link: button.link, icon: button.icon, key });
			const r = rise(n);
			const el = h(
				'a',
				{
					class: `tile ${r.class || ''}`,
					style: r.style,
					href: button.link,
					'data-nav': `t:${i}`,
					onclick: editClick(() => editTile(i)),
					...linkTargetProps(),
				},
				h(
					'span',
					{ class: 'tile__top' },
					icon(button.icon),
					// In edit mode the pencil takes the shortcut number's place
					editing
						? h('span', { class: 'tile__edit', 'aria-hidden': 'true' }, icon('pencil', 14, 2))
						: key && h('span', { class: 'tile__key' }, key)
				),
				h(
					'span',
					{ class: 'tile__label' },
					h('span', { class: 'tile__name' }, button.name),
					h('span', { class: 'tile__domain' }, domainOf(button.link))
				)
			);
			sortable(el, tiles, i);
			return el;
		}),
		editing && addButton('Add site', 'tile', 't:new', () => editTile(-1))
	);

const renderLists = (lists) =>
	h(
		'section',
		{ class: 'links__group links__group--lists', 'aria-label': 'Lists' },
		lists.map((list, i) => {
			const r = rise(i + 4);
			const el = h(
				'div',
				{ class: `list ${r.class || ''}`, style: r.style },
				h(
					editing ? 'button' : 'div',
					{
						class: 'list__head',
						type: editing ? 'button' : null,
						'data-nav': editing ? `h:${i}` : null,
						onclick: editClick(() => editList(i)),
					},
					h(
						'span',
						{ class: 'list__title' },
						h('span', { class: 'eyebrow' }, list.title),
						editing && h('span', { class: 'list__pencil' }, icon('pencil', 13, 1.75))
					),
					icon(list.icon, 16, 1.5)
				),
				h(
					'div',
					{ class: 'list__items' },
					list.links.map((item, j) => {
						ALL_LINKS.push({ name: item.name, link: item.link, group: list.title });
						const a = h(
							'a',
							{
								class: 'list__item',
								href: item.link,
								'data-nav': `l:${i}:${j}`,
								onclick: editClick(() => editItem(list, j)),
								...linkTargetProps(),
							},
							editing
								? h('span', { class: 'list__grip', 'aria-hidden': 'true' }, icon('grip-vertical', 14, 1.75))
								: h('span', { class: 'list__index' }, String(j + 1).padStart(2, '0')),
							h('span', { class: 'list__name' }, item.name),
							editing && h('span', { class: 'list__edit', 'aria-hidden': 'true' }, icon('pencil', 14, 1.75))
						);
						sortable(a, list.links, j);
						return a;
					}),
					editing && addButton('Add link', 'list__add', `a:${i}`, () => editItem(list, -1))
				)
			);
			sortable(el, lists, i);
			return el;
		}),
		editing && addButton('Add list', 'list', 'h:new', () => editList(-1))
	);

const render = () => {
	const focused = document.activeElement && linksEl.contains(document.activeElement) && document.activeElement.dataset.nav;
	PINNED.length = 0;
	ALL_LINKS.length = 0;
	const groups = [];
	if (CONFIG.bentoLayout !== 'lists') groups.push(renderTiles(LINKS.tiles));
	if (CONFIG.bentoLayout !== 'buttons') groups.push(renderLists(LINKS.lists));
	linksEl.className = `links${CONFIG.bentoLayout === 'lists' || CONFIG.bentoLayout === 'buttons' ? ` links--${CONFIG.bentoLayout}` : ''}`;
	linksEl.replaceChildren(...groups);
	firstRender = false;

	const target = focusAfterRender || focused;
	focusAfterRender = null;
	setTabStop(target ? linksEl.querySelector(`[data-nav="${target}"]`) : null);
	if (target && rovingStop) rovingStop.focus();

	const hint = document.getElementById('pinnedHint');
	hint.textContent = PINNED.length === 1 ? '1' : `1–${Math.min(PINNED.length, 9)}`;
	hint.parentElement.hidden = !PINNED.length;
};

// ┬┌─┌─┐┬ ┬┌┐ ┌─┐┌─┐┬─┐┌┬┐
// ├┴┐├┤ └┬┘├┴┐│ │├─┤├┬┘ ││
// ┴ ┴└─┘ ┴ └─┘└─┘┴ ┴┴└──┴┘
// The links are one Tab stop; arrows move to the nearest item in that direction,
// out to the footer buttons below and back up to search above.

const LAST_FOCUS_KEY = 'tiffin-last-focus';
const footerEl = document.querySelector('.footer');

let rovingStop = null;
const navItems = () => [...linksEl.querySelectorAll('[data-nav]')];
// Footer buttons join arrow navigation but keep their own Tab stops.
const arrowTargets = () => [...navItems(), ...[...footerEl.querySelectorAll('button')].filter((b) => b.offsetParent)];

const setTabStop = (el) => {
	const items = navItems();
	rovingStop = el && items.includes(el) ? el : items[0] || null;
	for (const item of items) item.tabIndex = item === rovingStop ? 0 : -1;
};

linksEl.addEventListener('focusin', (e) => {
	const el = e.target.closest('[data-nav]');
	if (!el) return;
	if (el !== rovingStop) setTabStop(el);
	try {
		localStorage.setItem(LAST_FOCUS_KEY, el.dataset.nav);
	} catch (err) {
		// Storage unavailable; arrows then start at the first tile.
	}
});

// Focus the item used last (even in an earlier tab), or the first one.
const focusLinks = () => {
	let nav = null;
	try {
		nav = localStorage.getItem(LAST_FOCUS_KEY);
	} catch (e) {
		// Storage unavailable; start at the first tile.
	}
	const el = (nav && linksEl.querySelector(`[data-nav="${CSS.escape(nav)}"]`)) || navItems()[0];
	if (el) el.focus();
};

const nearest = (from, [dx, dy]) => {
	const r = from.getBoundingClientRect();
	const cx = r.left + r.width / 2;
	const cy = r.top + r.height / 2;
	let best = null;
	let bestScore = Infinity;
	for (const el of arrowTargets()) {
		if (el === from) continue;
		const o = el.getBoundingClientRect();
		const ox = o.left + o.width / 2 - cx;
		const oy = o.top + o.height / 2 - cy;
		const along = dx ? ox * dx : oy * dy;
		if (along <= 4) continue;
		const score = along + (dx ? Math.abs(oy) : Math.abs(ox)) * 2.5;
		if (score < bestScore) [best, bestScore] = [el, score];
	}
	return best;
};

const gridColumns = (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length;

// Alt+arrows in edit mode: move the focused tile, list or link one step.
const reorder = (el, [dx, dy]) => {
	const [kind, a, b] = el.dataset.nav.split(':');
	let list, i, step, nav;
	if (kind === 't' && a !== 'new') {
		[list, i, step] = [LINKS.tiles, +a, dx || dy * gridColumns(el.parentElement)];
		nav = (to) => `t:${to}`;
	} else if (kind === 'l' && dy) {
		[list, i, step] = [LINKS.lists[+a].links, +b, dy];
		nav = (to) => `l:${a}:${to}`;
	} else if (kind === 'h' && a !== 'new') {
		[list, i, step] = [LINKS.lists, +a, dx || dy];
		nav = (to) => `h:${to}`;
	} else return;
	const to = i + step;
	if (to < 0 || to >= list.length) return;
	list.splice(to, 0, ...list.splice(i, 1));
	focusAfterRender = nav(to);
	commit();
	announce(`Moved to position ${to + 1} of ${list.length}`);
};

const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

document.addEventListener('keydown', (e) => {
	const dir = ARROWS[e.key];
	const homeEnd = e.key === 'Home' || e.key === 'End';
	if ((!dir && !homeEnd) || e.ctrlKey || e.metaKey || document.querySelector('dialog[open]')) return;

	const el = document.activeElement;
	const inLinks = el && linksEl.contains(el) && el.dataset.nav;
	const inFooter = el && footerEl.contains(el) && el.matches('button');
	if (!inLinks && !inFooter) {
		// Nothing focused yet: the first arrow press lands on the links.
		if (dir && !e.altKey && (!el || el === document.body)) {
			e.preventDefault();
			focusLinks();
		}
		return;
	}

	e.preventDefault();
	if (homeEnd) {
		const items = navItems();
		if (items.length) items[e.key === 'Home' ? 0 : items.length - 1].focus();
		return;
	}
	if (e.altKey) {
		if (editing && inLinks) reorder(el, dir);
		return;
	}
	const next = nearest(el, dir);
	if (next) next.focus();
	else if (dir[1] === -1) searchInput.focus();
});

// N in edit mode: add a link to the focused list, or a site when a tile is focused.
const addFromFocus = () => {
	const el = document.activeElement && document.activeElement.closest('[data-nav]');
	const [kind, a] = el && linksEl.contains(el) ? el.dataset.nav.split(':') : [];
	if ((kind === 'l' || kind === 'a' || kind === 'h') && LINKS.lists[+a]) editItem(LINKS.lists[+a], -1);
	else if (CONFIG.bentoLayout !== 'lists') editTile(-1);
	else editList(-1);
};

const setEditing = (on) => {
	editing = on;
	document.body.classList.toggle('is-editing', on);
	editButton.setAttribute('aria-pressed', String(on));
	render();
	announce(on ? 'Edit mode on. Enter edits, Alt+arrows reorders, N adds.' : 'Edit mode off');
};

// ┌─┐┌─┐┌─┐┌┬┐┌─┐┬─┐  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
// ├┤ │ ││ │ │ ├┤ ├┬┘  ├─┤│   │ ││ ││││└─┐
// └  └─┘└─┘ ┴ └─┘┴└─  ┴ ┴└─┘ ┴ ┴└─┘┘└┘└─┘

const editButton = document.getElementById('editButton');
const importInput = document.getElementById('importInput');

editButton.append(icon('pencil', 18, 1.75));
editButton.addEventListener('click', () => setEditing(!editing));
document.getElementById('editDone').addEventListener('click', () => setEditing(false));

document.getElementById('editExport').addEventListener('click', () => {
	const blob = new Blob([JSON.stringify(LINKS, null, '\t')], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	h('a', { href: url, download: 'tiffin-links.json' }).click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.getElementById('editImport').addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
	const file = importInput.files[0];
	importInput.value = '';
	if (!file) return;
	try {
		LINKS = cleanLinks(JSON.parse(await file.text()));
		commit();
	} catch (e) {
		alert("That file isn't a Tiffin links export.");
	}
});

document.getElementById('editReset').addEventListener('click', async () => {
	if (!confirm('Replace all your pinned sites and lists with the defaults from config.js?')) return;
	await resetLinks();
	LINKS = defaultLinks();
	render();
});

loadLinks().then((links) => {
	LINKS = links;
	render();
});

onLinksChanged(async () => {
	if (document.getElementById('editor').open) return; // don't shift indices under an open editor
	LINKS = await loadLinks();
	render();
});
