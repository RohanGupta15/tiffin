// Builds the Chrome Web Store / Edge Add-ons zip from the same source as the Firefox build.
// It copies what web-ext would ship, swaps in a Chrome manifest, then zips it with web-ext.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import config from '../web-ext-config.mjs';

const out = 'dist/chrome';
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const skip = new Set([...config.ignoreFiles, 'dist', 'scripts', 'node_modules', 'web-ext-artifacts', '.git']);

// Chrome only lets the homepage point at a domain verified in Search Console, so Tiffin replaces the new tab only.
delete manifest.chrome_settings_overrides;
manifest.description = 'Bento, one tier up: a typographic new tab page.';
// Firefox-only: the add-on id and its data-collection consent.
delete manifest.browser_specific_settings;
// Chrome doesn't accept SVG icons.
manifest.icons = { 16: 'assets/icons/tiffin-16.png', 48: 'assets/icons/tiffin-48.png', 128: 'assets/icons/tiffin-128.png' };

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
// Like web-ext: skip the ignore list and dotfiles.
const keep = (src) => !skip.has(src.replace(/\\/g, '/')) && !/(^|[\\/])\./.test(src);
for (const entry of readdirSync('.')) if (keep(entry)) cpSync(entry, `${out}/${entry}`, { recursive: true, filter: keep });
writeFileSync(`${out}/manifest.json`, `${JSON.stringify(manifest, null, '\t')}\n`);

execSync(`npx web-ext build -s ${out} -a web-ext-artifacts --overwrite-dest --filename tiffin-chrome-{version}.zip`, { stdio: 'inherit' });
