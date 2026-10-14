const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const load = (stored) => {
	const ctx = vm.createContext({ CONFIG: { accent: 'indigo' }, localStorage: { getItem: () => stored } });
	vm.runInContext(fs.readFileSync(`${__dirname}/../assets/js/settings.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
	return ctx;
};

test('only known settings of the right type survive', () => {
	const { cleanSettings } = load(null);
	const clean = cleanSettings({ name: '  Ada  ', theme: 'neon', latitude: 38.7, weatherUnit: 'F', evil: '<script>' });
	assert.deepEqual({ ...clean }, { name: 'Ada', latitude: 38.7, weatherUnit: 'F' });
});

test('saved settings and the accent apply before first paint', () => {
	const { CONFIG } = load(JSON.stringify({ name: 'Ada', accent: 'teal' }));
	assert.equal(CONFIG.name, 'Ada');
	assert.equal(CONFIG.accentLight, '#0F8A86');
});

test('corrupt saved settings fall back to config.js', () => {
	const { CONFIG } = load('{not json');
	assert.equal(CONFIG.accentLight, '#4F6BED');
});
