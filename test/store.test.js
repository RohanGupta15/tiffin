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

test('first-run import: top sites become tiles, bookmark folders become lists, defaults fill gaps', () => {
	const { importedLinks } = load({});
	const defaults = {
		tiles: [{ name: 'GitHub', icon: 'github', link: 'https://github.com/' }, { name: 'Mail', icon: 'mail', link: 'https://mail.google.com/' }, { name: 'X', icon: 'x', link: 'https://x.com/' }],
		lists: [{ title: 'Read', icon: 'book', links: [{ name: 'HN', link: 'https://news.ycombinator.com/' }] }, { title: 'Watch', icon: 'tv', links: [{ name: 'YT', link: 'https://youtube.com/' }] }],
	};
	const top = [
		{ url: 'https://www.github.com/', title: 'GitHub · Build and ship software on a single platform' },
		{ url: 'https://github.com/pulls', title: 'Pull requests' },
		{ url: 'javascript:alert(1)', title: 'bad' },
	];
	const bar = { children: [
		{ url: 'https://a.com/', title: 'A' },
		{ title: 'Dev', children: [{ url: 'https://mdn.dev/', title: 'MDN Web Docs - the very long tagline here' }, { title: 'empty', children: [] }] },
		{ title: 'Empty', children: [] },
	] };
	const r = importedLinks(top, bar, defaults);
	assert.deepEqual(r.tiles.map((t) => t.link), ['https://www.github.com/', 'https://mail.google.com/', 'https://x.com/']);
	assert.equal(r.tiles[0].name, 'GitHub');
	assert.deepEqual(r.lists.map((l) => l.title), ['Bookmarks', 'Dev']);
	assert.equal(r.lists[1].links[0].name, 'MDN Web Docs');

	const none = importedLinks([], undefined, defaults);
	assert.deepEqual(none.tiles.map((t) => t.name), ['GitHub', 'Mail', 'X']);
	assert.deepEqual(none.lists.map((l) => l.title), ['Read', 'Watch']);
});
