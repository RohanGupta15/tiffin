// Prints the next release version, from the last v* tag and the commit titles since it:
// "feat!:" or "BREAKING CHANGE" bumps major, "feat:" bumps minor, anything else bumps patch.
// With no tag yet, it starts from manifest.json's version.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const nextVersion = (base, log) => {
	const [major, minor, patch] = base.split('.').map(Number);
	if (/^\w+(\(.*\))?!:|BREAKING CHANGE/m.test(log)) return `${major + 1}.0.0`;
	if (/^feat(\(.*\))?:/m.test(log)) return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	let last = '';
	try {
		last = sh('git describe --tags --abbrev=0 --match "v*"');
	} catch {} // no release tag yet
	const base = last ? last.slice(1) : JSON.parse(readFileSync('manifest.json', 'utf8')).version;
	console.log(nextVersion(base, sh(`git log ${last ? `${last}..HEAD` : 'HEAD'} --format=%s%n%b`)));
}
