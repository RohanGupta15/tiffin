// ┌─┐┌─┐┌┬┐┌┬┐┬┌┐┌┌─┐┌─┐
// └─┐├┤  │  │ │││││ ┬└─┐
// └─┘└─┘ ┴  ┴ ┴┘└┘└─┘└─┘
// Your settings, layered over config.js. Runs in <head> before first paint: it reads
// a local copy so the page renders right away; settings-ui.js keeps that copy in step
// with Firefox Sync.

const SETTINGS_KEY = 'tiffin-settings';

// Each accent is a pair, tuned for contrast on the light and dark backgrounds.
const ACCENTS = {
	indigo: ['#4F6BED', '#8FA8FF'],
	teal: ['#0F8A86', '#5ED3CC'],
	green: ['#2F8A3E', '#7BD88F'],
	amber: ['#B86E00', '#F2B45A'],
	rose: ['#C2366B', '#F58FB5'],
	graphite: ['#3F4450', '#B9BFCC'],
};

const SETTING_TYPES = {
	name: 'string',
	showGreeting: 'boolean',
	city: 'string',
	latitude: 'number',
	longitude: 'number',
	weatherUnit: ['C', 'F'],
	twelveHourFormat: 'boolean',
	openInNewTab: 'boolean',
	bentoLayout: ['bento', 'lists', 'buttons'],
	theme: ['auto', 'light', 'dark'],
	accent: Object.keys(ACCENTS),
	onboarded: 'boolean',
};

// Keeps only known settings with the right type, so bad synced data can't break the page.
const cleanSettings = (data) => {
	const clean = {};
	for (const [key, type] of Object.entries(SETTING_TYPES)) {
		const value = data && data[key];
		if (Array.isArray(type) ? type.includes(value) : typeof value === type) clean[key] = value;
	}
	if (typeof clean.name === 'string') clean.name = clean.name.trim().slice(0, 40);
	return clean;
};

const readLocalSettings = () => {
	try {
		return cleanSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
	} catch (e) {
		return {};
	}
};

const applySettings = (settings) => {
	Object.assign(CONFIG, settings);
	const accent = ACCENTS[CONFIG.accent];
	if (accent) [CONFIG.accentLight, CONFIG.accentDark] = accent;
};

applySettings(readLocalSettings());
