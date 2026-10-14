// ┌─┐┌┬┐┬┌┬┐┌─┐┬─┐
// ├┤  │││ │ │ │├┬┘
// └─┘─┴┘┴ ┴ └─┘┴└─
// One small dialog for editing a tile, a list or a list link.

// Every Lucide icon name, for the icon field's suggestions: 'ShoppingBag' → 'shopping-bag'.
const ICON_NAMES = Object.keys(lucide.icons).map((k) => k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase());

const openEditor = ({ heading, fields, values, onSave, onDelete }) => {
	const dialog = document.getElementById('editor');

	const field = (f) => {
		const input = h('input', {
			name: f.key,
			value: values[f.key] ?? '',
			type: f.type || 'text',
			required: f.required || f.kind === 'url',
			pattern: f.required ? '.*\\S.*' : null, // not just spaces
			min: f.type === 'number' ? 1 : null,
			max: f.max,
			list: f.kind === 'icon' ? 'iconNames' : null,
			placeholder: f.kind === 'url' ? 'example.com' : f.kind === 'icon' ? 'e.g. github, mail, music' : null,
			autocomplete: 'off',
			spellcheck: 'false',
		});
		const extra = [];
		if (f.kind === 'url') {
			const check = () => input.setCustomValidity(normalizeUrl(input.value) ? '' : 'Enter a web address, like example.com');
			input.addEventListener('input', check);
			check();
		}
		if (f.kind === 'icon') {
			const preview = h('span', { class: 'editor__preview' });
			const update = () => preview.replaceChildren(icon(input.value || 'link', 20, 1.5));
			input.addEventListener('input', update);
			update();
			extra.push(preview);
		}
		return h(
			'label',
			{ class: 'editor__field' },
			h('span', { class: 'eyebrow' }, f.label),
			h('span', { class: 'editor__control' }, input, extra)
		);
	};

	const form = h(
		'form',
		{ method: 'dialog', class: 'editor__form' },
		h('h2', { class: 'editor__title' }, heading),
		fields.filter(Boolean).map(field),
		h(
			'div',
			{ class: 'editor__actions' },
			onDelete &&
				h('button', { type: 'button', class: 'editor__delete', onclick: () => (dialog.close(), onDelete()) }, 'Delete'),
			h('button', { type: 'submit', value: 'cancel', formnovalidate: true }, 'Cancel'),
			h('button', { type: 'submit', value: 'save', class: 'editor__save' }, 'Save')
		)
	);

	form.addEventListener('submit', (e) => {
		if (!e.submitter || e.submitter.value !== 'save') return;
		const data = Object.fromEntries(new FormData(form));
		for (const k of Object.keys(data)) data[k] = data[k].trim();
		onSave(data);
	});

	if (!document.getElementById('iconNames'))
		document.body.append(h('datalist', { id: 'iconNames' }, ICON_NAMES.map((value) => h('option', { value }))));

	dialog.replaceChildren(form);
	dialog.showModal();
};
