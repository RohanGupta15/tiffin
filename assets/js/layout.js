// ┬  ┌─┐┬ ┬┌─┐┬ ┬┌┬┐
// │  ├─┤└┬┘│ ││ │ │
// ┴─┘┴ ┴ ┴ └─┘└─┘ ┴
// Builds the tiles and lists from CONFIG, and collects every link for search.

const PINNED = []; // tiles, in order: keys 1–9 open them
const ALL_LINKS = []; // everything search can jump to

const renderTiles = (buttons) =>
	h(
		'nav',
		{ class: 'links__group links__group--tiles', 'aria-label': 'Pinned' },
		buttons.map((button) => {
			PINNED.push(button);
			const n = PINNED.length;
			const key = n <= 9 ? String(n) : '';
			ALL_LINKS.push({ name: button.name, link: button.link, icon: button.icon, key });
			return h(
				'a',
				{ class: 'tile rise', href: button.link, style: `--i: ${n}`, ...linkTargetProps() },
				h('span', { class: 'tile__top' }, icon(button.icon), key && h('span', { class: 'tile__key' }, key)),
				h(
					'span',
					{ class: 'tile__label' },
					h('span', { class: 'tile__name' }, button.name),
					h('span', { class: 'tile__domain' }, domainOf(button.link))
				)
			);
		})
	);

const renderLists = (lists) =>
	h(
		'section',
		{ class: 'links__group links__group--lists', 'aria-label': 'Lists' },
		lists.map((list, i) =>
			h(
				'div',
				{ class: 'list rise', style: `--i: ${i + 4}` },
				h(
					'div',
					{ class: 'list__head' },
					h('span', { class: 'eyebrow' }, list.title || ''),
					icon(list.icon, 16, 1.5)
				),
				h(
					'div',
					{ class: 'list__items' },
					list.links.map((item, j) => {
						ALL_LINKS.push({ name: item.name, link: item.link, group: list.title });
						return h(
							'a',
							{ class: 'list__item', href: item.link, ...linkTargetProps() },
							h('span', { class: 'list__index' }, String(j + 1).padStart(2, '0')),
							h('span', { class: 'list__name' }, item.name)
						);
					})
				)
			)
		)
	);

(() => {
	const links = document.getElementById('links');
	const firstButtons = CONFIG.firstButtonsContainer || [];
	const secondButtons = CONFIG.secondButtonsContainer || [];
	const firstLists = CONFIG.firstlistsContainer || [];
	const secondLists = CONFIG.secondListsContainer || [];

	switch (CONFIG.bentoLayout) {
		case 'lists':
			links.classList.add('links--lists');
			links.append(renderLists([...firstLists, ...secondLists]));
			break;
		case 'buttons':
			links.classList.add('links--buttons');
			links.append(renderTiles([...firstButtons, ...secondButtons]));
			break;
		default:
			links.append(renderTiles(firstButtons), renderLists(firstLists));
	}

	const hint = document.getElementById('pinnedHint');
	if (PINNED.length) hint.textContent = PINNED.length === 1 ? '1' : `1–${Math.min(PINNED.length, 9)}`;
	else hint.parentElement.remove();
})();
