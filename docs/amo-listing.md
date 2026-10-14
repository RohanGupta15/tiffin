# addons.mozilla.org listing

Copy these into the AMO developer hub when submitting.

**Name:** Tiffin

**Add-on URL (slug):** tiffin

**Summary** (max 250 characters):
> A fast, keyboard-first new tab: a type-led clock, search that jumps to your links, pinned sites and lists you edit in place, and optional weather. Syncs with Firefox, no account, no tracking.

**Description:**

> Tiffin replaces your new tab and home page with a calm, typographic start page built for speed.
>
> **Your links, your way**
> • Pinned sites and titled lists, edited right on the page: press E, click anything, drag to reorder
> • Pick icons from a searchable set of 1,500 line icons
> • Undo any delete with Ctrl+Z
> • Syncs across your devices with Firefox Sync, with export and import as a backup
>
> **Made for the keyboard**
> • / to search the web or jump straight to a link
> • 1–9 open pinned sites; arrow keys move across everything
> • ? shows every shortcut
>
> **Quietly beautiful**
> • A clock whose weight follows the day: thin at night, bold at midday
> • Light and dark themes that follow your system, with six accent colours
> • Fits on one screen, from laptops to large monitors
>
> **Private by design**
> • No account, no analytics, no tracking
> • Weather is optional and asks before it shares your city with Open-Meteo
>
> Tiffin builds on Bento by Miguel Ávila and is open source under GPL-3.0.

**Categories:** Appearance (primary), Tabs

**Tags:** new tab, homepage, start page, dashboard, keyboard, minimal

**Support site:** https://github.com/RohanGupta15/tiffin/issues
**Homepage:** https://github.com/RohanGupta15/tiffin

**License:** GNU General Public License v3.0

**Privacy policy:** paste PRIVACY.md (AMO requires one because weather sends a city to Open-Meteo)

**Screenshots** (1280×800): `docs/screenshots/`

**Notes to reviewer:**
> No build step and no remote code: all files ship as written. `assets/vendor/lucide.min.js` is the unmodified Lucide v0.469.0 UMD build (https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js). Fonts are bundled under the SIL Open Font License.
> Network use: only api.open-meteo.com and geocoding-api.open-meteo.com, and only after the user picks a city and grants the optional locationInfo data permission.
> To test: open a new tab; press , for settings and search a city to see weather; press E to edit links.
