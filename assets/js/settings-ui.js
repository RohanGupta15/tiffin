// ┌─┐┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐┌─┐  ┬ ┬┬
// └─┐├┤  │  │ │││││ ┬└─┐  │ ││
// └─┘└─┘ ┴  ┴ ┴┘└┘└─┘└─┘  └─┘┴
// The settings panel (gear button or ,), the first-run welcome card, and keeping
// settings in step with Firefox Sync.

const settingsSync = ext && ext.storage && ext.storage.sync;
const settingsDialog = document.getElementById('settings');

const writeLocalSettings = (settings) => {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch (e) {
		// Storage unavailable; settings still sync and apply on the next load.
	}
};

const saveSettings = async (changes) => {
	const next = cleanSettings({ ...readLocalSettings(), ...changes });
	writeLocalSettings(next);
	if (settingsSync) await settingsSync.set({ settings: next });
	applySettings(next);
	return next;
};

// Firefox Sync may hold newer settings (another device). Adopt them and reload once.
const adoptSyncedSettings = (synced) => {
	const remote = cleanSettings(synced);
	if (JSON.stringify(remote) === JSON.stringify(readLocalSettings())) return;
	writeLocalSettings(remote);
	// Only reload if the local copy took; otherwise a blocked localStorage would reload forever.
	if (JSON.stringify(remote) === JSON.stringify(readLocalSettings()) && !settingsDialog.open) location.reload();
};

if (settingsSync) {
	settingsSync.get('settings').then(({ settings }) => {
		if (settings) adoptSyncedSettings(settings);
		else if (Object.keys(readLocalSettings()).length) settingsSync.set({ settings: readLocalSettings() });
	});
	ext.storage.onChanged.addListener((changes, area) => {
		if (area === 'sync' && changes.settings && changes.settings.newValue) adoptSyncedSettings(changes.settings.newValue);
	});
}

// ┌─┐┬┌┬┐┬ ┬
// │  │ │ └┬┘
// └─┘┴ ┴  ┴

// Firefox asks once whether Tiffin may send the city to Open-Meteo. Must run inside the click.
// Chrome and Edge have no data-collection permission; their store privacy disclosure covers it.
const askLocationConsent = () => {
	if (typeof browser === 'undefined' || !browser.permissions) return Promise.resolve(true);
	return browser.permissions.request({ data_collection: ['locationInfo'] }).catch(() => false);
};

const searchCities = async (query) => {
	const url = `https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name=${encodeURIComponent(query)}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
	const json = await response.json();
	return (json.results || []).map((c) => ({
		city: [c.name, c.admin1, c.country].filter(Boolean).join(', '),
		latitude: Math.round(c.latitude * 1000) / 1000,
		longitude: Math.round(c.longitude * 1000) / 1000,
	}));
};

// ┌─┐┌─┐┌┐┌┌─┐┬
// ├─┘├─┤│││├┤ │
// ┴  ┴ ┴┘└┘└─┘┴─┘

const choice = (name, value, options) =>
	h(
		'div',
		{ class: 'segmented', role: 'radiogroup' },
		options.map(([v, label]) =>
			h('label', {}, h('input', { type: 'radio', name, value: v, checked: v === value }), h('span', {}, label))
		)
	);

const toggle = (name, label, checked) =>
	h('label', { class: 'toggle' }, h('input', { type: 'checkbox', name, checked }), h('span', {}, label));

const section = (title, ...children) =>
	h('fieldset', { class: 'settings__section' }, h('legend', { class: 'editor__label' }, title), ...children);

const openSettings = () => {
	let place = Number.isFinite(CONFIG.latitude)
		? { city: CONFIG.city, latitude: CONFIG.latitude, longitude: CONFIG.longitude }
		: null;

	const cityName = h('span', { class: 'settings__city' });
	const removeCity = h('button', { type: 'button', class: 'settings__link' }, 'Remove');
	const cityQuery = h('input', {
		type: 'text',
		placeholder: 'Search a city, like Lisbon',
		'aria-label': 'City',
		autocomplete: 'off',
		spellcheck: 'false',
	});
	const cityButton = h('button', { type: 'button', class: 'editor__cancel' }, 'Search');
	const cityResults = h('div', { class: 'settings__results', role: 'listbox', 'aria-label': 'Cities' });
	const cityStatus = h('p', { class: 'settings__note', role: 'status' });

	const showPlace = () => {
		cityName.textContent = place ? place.city : 'No city yet: weather is hidden';
		removeCity.hidden = !place;
	};

	const findCity = (e) => {
		if (e) e.preventDefault();
		const query = cityQuery.value.trim();
		if (!query) return cityQuery.focus();
		askLocationConsent().then(async (allowed) => {
			if (!allowed) {
				cityStatus.textContent = 'Weather needs your OK to send the city to Open-Meteo. You can allow it here or in about:addons.';
				return;
			}
			cityStatus.textContent = 'Searching…';
			try {
				const found = await searchCities(query);
				cityStatus.textContent = found.length ? '' : `No city called “${query}”. Check the spelling?`;
				cityResults.replaceChildren(
					...found.map((c) =>
						h(
							'button',
							{
								type: 'button',
								role: 'option',
								class: 'settings__result',
								onclick: () => {
									place = c;
									cityResults.replaceChildren();
									cityQuery.value = '';
									showPlace();
								},
							},
							c.city
						)
					)
				);
				if (found.length) cityResults.firstChild.focus();
			} catch (err) {
				cityStatus.textContent = "Couldn't reach Open-Meteo. Check your connection and try again.";
			}
		});
	};

	cityButton.addEventListener('click', findCity);
	cityQuery.addEventListener('keydown', (e) => e.key === 'Enter' && findCity(e));
	removeCity.addEventListener('click', () => {
		place = null;
		showPlace();
	});
	showPlace();

	const form = h(
		'form',
		{ method: 'dialog', class: 'editor__form settings__form' },
		h('h2', { class: 'editor__title' }, 'Settings'),
		section(
			'You',
			h('label', { class: 'editor__field' }, h('span', { class: 'sr-only' }, 'Name'), h('input', { name: 'name', value: CONFIG.name || '', placeholder: 'Your name', maxlength: 40, autocomplete: 'given-name' })),
			toggle('showGreeting', 'Show the greeting', CONFIG.showGreeting !== false)
		),
		section(
			'Weather',
			h('div', { class: 'settings__row' }, cityName, removeCity),
			h('div', { class: 'settings__row' }, cityQuery, cityButton),
			cityResults,
			cityStatus,
			choice('weatherUnit', CONFIG.weatherUnit, [['C', '°C'], ['F', '°F']])
		),
		section(
			'Clock and links',
			choice('clock', CONFIG.twelveHourFormat ? '12' : '24', [['24', '24-hour'], ['12', '12-hour']]),
			choice('bentoLayout', CONFIG.bentoLayout, [['bento', 'Tiles + lists'], ['buttons', 'Tiles'], ['lists', 'Lists']]),
			toggle('openInNewTab', 'Open links in a new tab', !!CONFIG.openInNewTab)
		),
		section(
			'Look',
			choice('theme', CONFIG.theme, [['auto', 'Match system'], ['light', 'Light'], ['dark', 'Dark']]),
			h(
				'div',
				{ class: 'swatches', role: 'radiogroup', 'aria-label': 'Accent colour' },
				Object.entries(ACCENTS).map(([key, [light, dark]]) =>
					h(
						'label',
						{ class: 'swatch', title: key, style: `--swatch-light: ${light}; --swatch-dark: ${dark}` },
						h('input', { type: 'radio', name: 'accent', value: key, checked: key === CONFIG.accent, 'aria-label': key })
					)
				)
			)
		),
		h(
			'div',
			{ class: 'editor__actions' },
			h('button', { type: 'button', class: 'editor__cancel', onclick: () => settingsDialog.close() }, 'Cancel'),
			h('button', { type: 'submit', value: 'save', class: 'editor__save' }, 'Save', h('kbd', {}, 'Ctrl ↵'))
		)
	);

	form.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			form.requestSubmit(form.querySelector('.editor__save'));
		}
	});

	form.addEventListener('submit', async (e) => {
		if (!e.submitter || e.submitter.value !== 'save') return;
		const data = new FormData(form);
		const themeChanged = data.get('theme') !== CONFIG.theme;
		await saveSettings({
			name: data.get('name') || '',
			showGreeting: data.has('showGreeting'),
			weatherUnit: data.get('weatherUnit'),
			twelveHourFormat: data.get('clock') === '12',
			bentoLayout: data.get('bentoLayout'),
			openInNewTab: data.has('openInNewTab'),
			theme: data.get('theme'),
			accent: data.get('accent'),
			city: place ? place.city : '',
			latitude: place ? place.latitude : undefined,
			longitude: place ? place.longitude : undefined,
			onboarded: true,
		});
		if (themeChanged) {
			try {
				localStorage.removeItem(THEME_KEY); // a chosen theme replaces the T toggle's override
			} catch (err) {}
		}
		// shortcut: reloads to apply everything at once; re-render in place if reloads ever feel slow
		location.reload();
	});

	settingsDialog.replaceChildren(form);
	settingsDialog.showModal();
};

document.getElementById('settingsButton').append(icon('settings', 18, 1.75));
document.getElementById('settingsButton').addEventListener('click', openSettings);

// ┬ ┬┌─┐┬  ┌─┐┌─┐┌┬┐┌─┐
// │││├┤ │  │  │ ││││├┤
// └┴┘└─┘┴─┘└─┘└─┘┴ ┴└─┘
// First new tab only: ask for a name. Skipping is fine; the greeting works without one.

if (!CONFIG.onboarded && !CONFIG.name) {
	const input = h('input', { name: 'name', placeholder: 'Your name', maxlength: 40, autocomplete: 'given-name', 'aria-label': 'Your name' });
	const finish = async (name) => {
		await saveSettings({ name, onboarded: true });
		renderClock();
		card.remove();
	};
	const card = h(
		'form',
		{ class: 'welcome rise', style: '--i: 1', onsubmit: (e) => (e.preventDefault(), finish(input.value.trim())) },
		h('p', { class: 'welcome__title' }, 'Welcome to Tiffin. What should it call you?'),
		h('div', { class: 'welcome__row' }, input, h('button', { type: 'submit', class: 'welcome__save' }, 'Save'), h('button', { type: 'button', class: 'welcome__skip', onclick: () => finish('') }, 'Skip')),
		h('p', { class: 'welcome__hint' }, h('kbd', {}, 'E'), ' edits your links · ', h('kbd', {}, ','), ' opens settings · ', h('kbd', {}, '?'), ' lists every shortcut')
	);
	document.querySelector('.hero').after(card);
}
