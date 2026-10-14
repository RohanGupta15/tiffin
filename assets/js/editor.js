// ┌─┐┌┬┐┬┌┬┐┌─┐┬─┐
// ├┤  │││ │ │ │├┬┘
// └─┘─┴┘┴ ┴ └─┘┴└─
// One small dialog for editing a tile, a list or a list link, with a visual icon picker.

// Every Lucide icon name: 'ShoppingBag' → 'shopping-bag', 'Building2' → 'building-2'.
const ICON_NAMES = Object.keys(lucide.icons).map((k) =>
	k
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([a-z])([0-9])/g, '$1-$2')
		.toLowerCase()
);

// Lucide's bundle has no search keywords, so common words map to the icons people mean.
const ICON_SYNONYMS = {
	email: ['mail', 'inbox', 'at-sign'],
	inbox: ['inbox', 'mail'],
	message: ['message-circle', 'message-square'],
	chat: ['message-circle', 'messages-square'],
	phone: ['phone', 'smartphone'],
	video: ['video', 'tv', 'youtube', 'clapperboard'],
	movie: ['clapperboard', 'film', 'popcorn'],
	film: ['film', 'clapperboard'],
	stream: ['tv', 'radio', 'twitch'],
	music: ['music', 'headphones', 'disc-3', 'radio'],
	song: ['music', 'headphones'],
	podcast: ['podcast', 'mic', 'radio'],
	audio: ['headphones', 'volume-2', 'mic'],
	photo: ['image', 'camera', 'images'],
	picture: ['image', 'images'],
	art: ['palette', 'brush', 'pen-tool'],
	design: ['pen-tool', 'figma', 'palette', 'layout-grid'],
	code: ['code', 'code-xml', 'terminal', 'github', 'git-branch'],
	dev: ['code', 'terminal', 'git-branch', 'bug'],
	git: ['git-branch', 'github', 'gitlab'],
	server: ['server', 'database', 'cloud'],
	cloud: ['cloud', 'cloud-upload'],
	ai: ['sparkles', 'bot', 'brain'],
	robot: ['bot'],
	news: ['newspaper', 'rss'],
	blog: ['rss', 'pen-line', 'notebook-pen'],
	read: ['book-open', 'library', 'newspaper', 'glasses'],
	book: ['book', 'book-open', 'library'],
	learn: ['graduation-cap', 'book-open', 'school'],
	school: ['school', 'graduation-cap'],
	work: ['briefcase', 'building-2', 'laptop'],
	job: ['briefcase'],
	office: ['building-2', 'briefcase'],
	task: ['square-check', 'list-todo', 'check'],
	todo: ['list-todo', 'square-check'],
	note: ['notebook', 'sticky-note', 'file-text'],
	doc: ['file-text', 'files'],
	file: ['file', 'folder', 'files'],
	folder: ['folder', 'folder-open'],
	drive: ['hard-drive', 'cloud', 'folder'],
	calendar: ['calendar', 'calendar-days'],
	date: ['calendar'],
	time: ['clock', 'timer', 'hourglass'],
	shop: ['shopping-bag', 'shopping-cart', 'store'],
	store: ['store', 'shopping-bag'],
	buy: ['shopping-cart', 'credit-card'],
	money: ['wallet', 'banknote', 'piggy-bank', 'credit-card'],
	bank: ['landmark', 'piggy-bank', 'wallet'],
	finance: ['chart-line', 'wallet', 'landmark'],
	stock: ['chart-candlestick', 'trending-up'],
	chart: ['chart-line', 'chart-bar', 'chart-pie'],
	analytics: ['chart-line', 'chart-bar', 'activity'],
	social: ['users', 'at-sign', 'share-2'],
	friend: ['users', 'heart-handshake'],
	people: ['users', 'contact'],
	game: ['gamepad-2', 'joystick', 'dices'],
	gaming: ['gamepad-2', 'joystick'],
	food: ['utensils', 'pizza', 'coffee', 'chef-hat'],
	recipe: ['chef-hat', 'cooking-pot', 'utensils'],
	coffee: ['coffee'],
	travel: ['plane', 'map', 'luggage', 'compass'],
	map: ['map', 'map-pin', 'compass'],
	weather: ['cloud-sun', 'sun', 'cloud-rain'],
	health: ['heart-pulse', 'activity', 'stethoscope'],
	fitness: ['dumbbell', 'bike', 'activity'],
	sport: ['trophy', 'volleyball', 'dumbbell'],
	home: ['house'],
	house: ['house'],
	search: ['search', 'globe'],
	web: ['globe', 'link', 'compass'],
	website: ['globe', 'link'],
	settings: ['settings', 'sliders-horizontal'],
	security: ['shield', 'lock', 'key-round'],
	password: ['key-round', 'lock'],
	star: ['star', 'sparkles'],
	favorite: ['star', 'heart', 'bookmark'],
	save: ['bookmark', 'save'],
	love: ['heart'],
	twitter: ['twitter', 'at-sign'],
	x: ['twitter', 'x'],
	reddit: ['glasses', 'message-circle'],
	discord: ['bot', 'messages-square'],
	slack: ['slack', 'hash'],
	spotify: ['music', 'headphones'],
	amazon: ['shopping-bag', 'package'],
	google: ['search', 'globe'],
};

const COMMON_ICONS = ['link', 'globe', 'bookmark', 'star', 'mail', 'calendar', 'music', 'code', 'book-open', 'briefcase', 'house', 'heart'];

const hasIcon = (name) => ICON_NAMES.includes(name);

const synonymsFor = (word) =>
	Object.entries(ICON_SYNONYMS)
		.filter(([key]) => key.startsWith(word))
		.flatMap(([, names]) => names);

const searchIcons = (q) =>
	[...new Set([...synonymsFor(q), ...ICON_NAMES.filter((n) => n.startsWith(q)), ...ICON_NAMES.filter((n) => n.includes(q))])].filter(hasIcon);

// Icons that probably fit this link, from its name and domain, then the everyday ones.
const suggestIcons = (values) => {
	const words = `${values.name || values.title || ''} ${domainOf(normalizeUrl(values.link))}`
		.toLowerCase()
		.split(/[^a-z]+/)
		.filter((w) => w.length > 2 && !['com', 'www', 'org', 'net', 'app'].includes(w));
	const guessed = words.flatMap((w) => [...(ICON_SYNONYMS[w] || []), ...ICON_NAMES.filter((n) => n === w || n.startsWith(`${w}-`))]);
	return [...new Set([values.icon, ...guessed, ...COMMON_ICONS])].filter(hasIcon).slice(0, 12);
};

// A button showing the current icon; it opens a searchable, keyboard-driven grid.
const iconPicker = (f, values, labelId) => {
	const input = h('input', { type: 'hidden', name: f.key, value: values[f.key] || 'link' });
	const preview = h('span', { class: 'picker__current' });
	const name = h('span', { class: 'picker__name' });
	const toggle = h(
		'button',
		{ type: 'button', class: 'picker__toggle', 'aria-expanded': 'false', 'aria-labelledby': `${labelId} ${labelId}-value` },
		preview,
		h('span', { id: `${labelId}-value`, class: 'picker__value' }, name),
		h('span', { class: 'picker__chevron' }, icon('chevron-down', 16, 1.75))
	);
	const search = h('input', {
		type: 'text',
		class: 'picker__search',
		placeholder: `Search ${ICON_NAMES.length.toLocaleString()} icons`,
		role: 'combobox',
		'aria-expanded': 'true',
		'aria-controls': 'iconGrid',
		'aria-label': 'Search icons',
		autocomplete: 'off',
		spellcheck: 'false',
	});
	const grid = h('div', { class: 'picker__grid', id: 'iconGrid', role: 'listbox', 'aria-label': 'Icons' });
	const status = h('span', { class: 'picker__status' });
	const panel = h(
		'div',
		{ class: 'picker', hidden: true },
		h('label', { class: 'picker__searchbox' }, icon('search', 16, 1.75), search, h('kbd', {}, 'Esc')),
		grid,
		h('div', { class: 'picker__foot' }, status, h('span', {}, '↑↓←→ move · ↵ pick'))
	);

	let shown = [];
	let active = 0;

	const showCurrent = () => {
		preview.replaceChildren(icon(input.value, 20, 1.5));
		name.textContent = input.value;
	};

	const mark = () => {
		for (const cell of grid.querySelectorAll('.is-active')) cell.classList.remove('is-active');
		const cell = grid.children[active];
		status.textContent = shown[active] || '';
		if (!cell || !cell.classList.contains('picker__cell')) return search.removeAttribute('aria-activedescendant');
		cell.classList.add('is-active');
		cell.scrollIntoView({ block: 'nearest' });
		search.setAttribute('aria-activedescendant', cell.id);
	};

	const draw = () => {
		const q = search.value.trim().toLowerCase();
		const suggested = suggestIcons({ ...values, icon: input.value });
		// shortcut: draws at most 240 icons; add virtual scrolling if people want to browse all of them
		shown = (q ? searchIcons(q) : [...new Set([...suggested, ...ICON_NAMES])]).slice(0, 240);
		active = q ? 0 : Math.max(0, shown.indexOf(input.value));
		grid.replaceChildren(
			...(shown.length
				? shown.map((n, i) =>
						h(
							'button',
							{
								type: 'button',
								tabindex: '-1',
								role: 'option',
								id: `icon-${i}`,
								class: `picker__cell${n === input.value ? ' is-current' : ''}${!q && i === suggested.length - 1 ? ' is-last-suggested' : ''}`,
								title: n,
								'aria-label': n,
								'aria-selected': String(n === input.value),
								onclick: () => pick(n),
							},
							icon(n, 20, 1.5)
						)
				  )
				: [h('p', { class: 'picker__empty' }, `No icon matches “${q}”. Try a simpler word.`)])
		);
		mark();
	};

	const close = (refocus = true) => {
		panel.hidden = true;
		toggle.setAttribute('aria-expanded', 'false');
		if (refocus) toggle.focus();
	};

	const open = () => {
		panel.hidden = false;
		toggle.setAttribute('aria-expanded', 'true');
		search.value = '';
		draw();
		search.focus();
	};

	const pick = (n) => {
		input.value = n;
		showCurrent();
		close();
	};

	toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
	search.addEventListener('input', draw);
	search.addEventListener('keydown', (e) => {
		const cols = gridColumns(grid);
		const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
		if (move) {
			e.preventDefault();
			active = Math.max(0, Math.min(shown.length - 1, active + move));
			mark();
		} else if (e.key === 'Enter' && !e.ctrlKey) {
			e.preventDefault();
			if (shown[active]) pick(shown[active]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			close();
		}
	});

	showCurrent();
	return { control: h('div', { class: 'picker__wrap' }, input, toggle, panel), close, isOpen: () => !panel.hidden };
};

const openEditor = ({ heading, fields, values, onSave, onDelete }) => {
	const dialog = document.getElementById('editor');
	const pickers = [];

	const field = (f) => {
		const labelId = `field-${f.key}`;
		if (f.kind === 'icon') {
			const picker = iconPicker(f, values, labelId);
			pickers.push(picker);
			return h('div', { class: 'editor__field' }, h('span', { class: 'editor__label', id: labelId }, f.label), picker.control);
		}
		const input = h('input', {
			name: f.key,
			value: values[f.key] ?? '',
			type: f.type || 'text',
			class: f.kind === 'url' ? 'is-mono' : null,
			required: f.required || f.kind === 'url',
			pattern: f.required ? '.*\\S.*' : null, // not just spaces
			min: f.type === 'number' ? 1 : null,
			max: f.max,
			placeholder: f.kind === 'url' ? 'example.com' : null,
			autocomplete: 'off',
			spellcheck: 'false',
		});
		if (f.kind === 'url') {
			const check = () => input.setCustomValidity(normalizeUrl(input.value) ? '' : 'Enter a web address, like example.com');
			input.addEventListener('input', check);
			check();
		}
		return h('label', { class: 'editor__field' }, h('span', { class: 'editor__label' }, f.label), input);
	};

	const save = h('button', { type: 'submit', value: 'save', class: 'editor__save' }, 'Save', h('kbd', {}, 'Ctrl ↵'));
	const form = h(
		'form',
		{ method: 'dialog', class: 'editor__form' },
		h('h2', { class: 'editor__title' }, heading),
		fields.filter(Boolean).map(field),
		h(
			'div',
			{ class: 'editor__actions' },
			onDelete &&
				h(
					'button',
					{ type: 'button', class: 'editor__delete', onclick: () => (dialog.close(), onDelete()) },
					icon('trash-2', 15, 1.75),
					'Delete'
				),
			// type=button so Enter in a field submits with Save, the form's only submit button
			h('button', { type: 'button', class: 'editor__cancel', onclick: () => dialog.close() }, 'Cancel'),
			save
		)
	);

	form.addEventListener('submit', (e) => {
		if (!e.submitter || e.submitter.value !== 'save') return;
		const data = Object.fromEntries(new FormData(form));
		for (const k of Object.keys(data)) data[k] = data[k].trim();
		onSave(data);
	});

	form.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			form.requestSubmit(save);
		}
	});

	// Esc closes an open icon picker first, then the dialog.
	dialog.oncancel = (e) => {
		const open = pickers.find((p) => p.isOpen());
		if (open) {
			e.preventDefault();
			open.close();
		}
	};

	dialog.replaceChildren(form);
	dialog.showModal();
};
