const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const read = (f) => fs.readFileSync(`${__dirname}/../assets/js/${f}`, 'utf8').replace(/^const /gm, 'var ');
const ctx = vm.createContext({
	URL,
	CONFIG: {},
	lucide: { icons: { Mail: 1, Inbox: 1, AtSign: 1, Building2: 1, Github: 1, Link: 1, Globe: 1, Music: 1 } },
});
vm.runInContext(read('util.js') + read('store.js') + read('editor.js'), ctx);

test('icon names match Lucide file names', () => {
	assert.ok(ctx.ICON_NAMES.includes('building-2'));
	assert.ok(ctx.ICON_NAMES.includes('at-sign'));
});

test('synonyms find icons whose names differ', () => {
	assert.deepEqual([...ctx.searchIcons('email')], ['mail', 'inbox', 'at-sign']);
	assert.equal(ctx.searchIcons('zzz').length, 0);
});

test('suggestions start with the current icon, then guesses from the name and domain', () => {
	const s = ctx.suggestIcons({ name: 'Work mail', link: 'github.com', icon: 'link' });
	assert.equal(s[0], 'link');
	assert.ok(s.includes('mail') && s.includes('github'));
});
