// ┬  ┌─┐┬ ┬┌─┐┬ ┬┌┬┐
// │  ├─┤└┬┘│ ││ │ │
// ┴─┘┴ ┴ ┴ └─┘└─┘ ┴
// Builds the tiles and lists from your saved links, collects every link for
// search, and handles edit mode (E): click to edit, drag to reorder.

const PINNED = []; // tiles, in order: keys 1–9 open them
const ALL_LINKS = []; // everything search can jump to

let LINKS = { tiles: [], lists: [] };
let editing = false;
let firstRender = true;
let dragging = null;

const linksEl = document.getElementById('links');

const commit = () => {
	saveLinks(LINKS).catch((e) => alert(`Tiffin couldn't save your links: ${e.message}`));
	render();
};

// Drag one entry of `list` onto another entry of the same list to move it there.
const sortable = (el, list, i) => {
	if (!editing) return;
	el.draggable = true;
	el.addEventListener('dragstart', (e) => {
		e.stopPropagation();
		dragging = { list, i };
		e.dataTransfer.effectAllowed = 'move';
	});
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

// In edit mode a click edits instead of following the link.
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

const addButton = (label, cls, onclick) =>
	h('button', { class: `add ${cls}`, type: 'button', onclick }, icon('plus', 16, 1.75), h('span', {}, label));

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
		onDelete: !isNew && (() => (LINKS.tiles.splice(i, 1), commit())),
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
		onDelete:
			!isNew &&
			(() => {
				if (list.links.length && !confirm(`Delete "${list.title}" and its ${list.links.length} links?`)) return;
				LINKS.lists.splice(i, 1);
				commit();
			}),
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
		onDelete: !isNew && (() => (list.links.splice(j, 1), commit())),
	});
};

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
					onclick: editClick(() => editTile(i)),
					...linkTargetProps(),
				},
				h(
					'span',
					{ class: 'tile__top' },
					icon(button.icon),
					editing ? icon('pencil', 14, 1.75) : key && h('span', { class: 'tile__key' }, key)
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
		editing && addButton('Add site', 'tile', () => editTile(-1))
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
					{ class: 'list__head', type: editing ? 'button' : null, onclick: editClick(() => editList(i)) },
					h('span', { class: 'eyebrow' }, list.title),
					icon(editing ? 'pencil' : list.icon, 16, 1.5)
				),
				h(
					'div',
					{ class: 'list__items' },
					list.links.map((item, j) => {
						ALL_LINKS.push({ name: item.name, link: item.link, group: list.title });
						const a = h(
							'a',
							{ class: 'list__item', href: item.link, onclick: editClick(() => editItem(list, j)), ...linkTargetProps() },
							h('span', { class: 'list__index' }, String(j + 1).padStart(2, '0')),
							h('span', { class: 'list__name' }, item.name)
						);
						sortable(a, list.links, j);
						return a;
					}),
					editing && addButton('Add link', 'list__add', () => editItem(list, -1))
				)
			);
			sortable(el, lists, i);
			return el;
		}),
		editing && addButton('Add list', 'list', () => editList(-1))
	);

const render = () => {
	PINNED.length = 0;
	ALL_LINKS.length = 0;
	const groups = [];
	if (CONFIG.bentoLayout !== 'lists') groups.push(renderTiles(LINKS.tiles));
	if (CONFIG.bentoLayout !== 'buttons') groups.push(renderLists(LINKS.lists));
	linksEl.className = `links${CONFIG.bentoLayout === 'lists' || CONFIG.bentoLayout === 'buttons' ? ` links--${CONFIG.bentoLayout}` : ''}`;
	linksEl.replaceChildren(...groups);
	firstRender = false;

	const hint = document.getElementById('pinnedHint');
	hint.textContent = PINNED.length === 1 ? '1' : `1–${Math.min(PINNED.length, 9)}`;
	hint.parentElement.hidden = !PINNED.length;
};

const setEditing = (on) => {
	editing = on;
	document.body.classList.toggle('is-editing', on);
	editButton.setAttribute('aria-pressed', String(on));
	render();
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
