// Run with: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const load = (config) => {
	const ctx = vm.createContext({ CONFIG: config, URL, localStorage: { getItem: () => null } });
	vm.runInContext(fs.readFileSync(`${__dirname}/../assets/js/store.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
	return ctx;
};

test('normalizeUrl adds https and rejects non-web links', () => {
	const { normalizeUrl } = load({});
	assert.equal(normalizeUrl('github.com'), 'https://github.com/');
	assert.equal(normalizeUrl('localhost:3000'), 'https://localhost:3000/');
	assert.equal(normalizeUrl('javascript:alert(1)'), '');
	assert.equal(normalizeUrl('ftp://example.com'), '');
});

test('defaults come from config and drop bad entries', () => {
	const { defaultLinks } = load({
		bentoLayout: 'bento',
		firstButtonsContainer: [{ name: 'A', icon: 'x', link: 'https://a.com' }],
		secondButtonsContainer: [{ name: 'B', link: 'https://b.com' }],
		firstlistsContainer: [{ title: 'L', links: [{ name: 'x', link: 'javascript:void 0' }, { name: 'y', link: 'y.com' }] }],
	});
	const d = defaultLinks();
	assert.deepEqual(d.tiles.map((t) => t.name), ['A']);
	assert.deepEqual(d.lists[0].links.map((l) => l.link), ['https://y.com/']);
});
