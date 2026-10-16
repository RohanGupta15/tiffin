// Run with: npm test
const test = require('node:test');
const assert = require('node:assert');

test('commit titles pick the version bump', async () => {
	const { nextVersion } = await import('../scripts/next-version.mjs');
	assert.strictEqual(nextVersion('2.1.0', 'fix: city search\ndocs: readme'), '2.1.1');
	assert.strictEqual(nextVersion('2.1.0', 'fix: a\nfeat(search): b'), '2.2.0');
	assert.strictEqual(nextVersion('2.1.3', 'feat!: new storage'), '3.0.0');
	assert.strictEqual(nextVersion('2.1.3', 'fix: a\n\nBREAKING CHANGE: old links dropped'), '3.0.0');
	assert.strictEqual(nextVersion('2.1.0', 'Merge pull request #9 from x/dev'), '2.1.1');
});
