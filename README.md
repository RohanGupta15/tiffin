<p align="center">
  <img src="assets/icons/tiffin.svg" alt="Tiffin" width="88" />
</p>

<h1 align="center">Tiffin</h1>

<p align="center">
  <em>Bento, one tier up.</em><br />
  A typographic new tab and home page for Firefox.
</p>

<br />

Tiffin is the next step for [Bento](https://github.com/migueravila/Bento) by Miguel Ávila. Bento gave it the layout. Tiffin stacks a tier on top with a type-led redesign ("Couture"), a clock whose weight follows the day, search that jumps to your links, and a native Firefox extension that replaces the new tab and home page.

## 👇 Index
- [✨ Features](#-features)
- [🚀 Usage](#-usage)
- [🎨 Customization](#-customization)
- [🍱 Credits](#-credits)

## ✨ Features

- **Typography first ("Couture")**: Imbue, a condensed Didone, for the clock; Petrona Italic for the greeting; Onest for the interface; Reddit Mono for labels. All fonts are bundled (SIL Open Font License), so nothing loads from the network.
- **Day weight**: the clock's variable weight follows the day, thinnest at 1 am and heaviest at 1 pm.
- **Keyboard driven**: `/` to search, `1`–`9` to open pinned tiles, `↑ ↓ ↵` to pick a result, `T` to switch theme.
- **Search that jumps**: type a link's name to open it, type an address to go there, or press Enter to search with Firefox's default engine.
- **Weather with no API key** from [Open-Meteo](https://open-meteo.com), cached so new tabs show it instantly.
- **Dark/Light** follows your OS live; the toggle overrides it, and toggling back hands control back to the OS. No flash of the wrong theme.
- **Layouts**: `bento`, `lists` or `buttons`. Lists take any number of links.
- **Day progress** line, 12/24-hour clock, optional frosted wallpaper mode.

## 🚀 Usage

### 🏡 As Home Page

1. Fork this repo
2. Enable the Github Pages service `Settings → GitHub Pages → Source [master branch] → Save`
3. Set it as Home Page:
   - Click the menu button. and select Options. Preferences.
   - Click the Home panel.
   - Click the menu next to Homepage and new windows and choose to show custom URLs and add your `Github Pages link`

### 🦊 As a Firefox Extension (new tab + home page)

Tiffin is a Firefox WebExtension (`manifest.json`) that replaces the new tab and home page.

```bash
npm install
npm start        # launches a fresh Firefox profile with Tiffin loaded; auto-reloads on file changes
npm run lint     # validate the extension
npm run build    # zip into web-ext-artifacts/
```

To use it in your everyday Firefox without publishing, open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` (removed on restart). For a permanent install, sign the zip as an unlisted add-on on [addons.mozilla.org](https://addons.mozilla.org/developers/).

### ➕ As New Tab

You can use different Add-ons/Extensions for it

- If you use Firefox: [Custom New Tab Page](https://addons.mozilla.org/en-US/firefox/addon/custom-new-tab-page/?src=search) and make sure you enable "Force links to open in the top frame (experimental)" in the extension's preferences page.
- If you use Chromium (Brave, Vivaldi, Chrome): [Custom New Tab URL](https://chrome.google.com/webstore/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)

### 🐬 In a Docker Container

You can run Tiffin in a Docker container, either with `docker run`, or with the included `docker-compose` file.

#### Docker run
 1. Clone this repo: `git clone https://github.com/RohanGupta15/tiffin`
 2. Build the image: `docker build -t tiffin .`
 3. Run it with your config, changing the port mapping if needed: `docker run -d -p 80:80 -v <config.js location>:/usr/share/nginx/html/config.js tiffin`

#### docker-compose
  1. Clone this repo with `git clone https://github.com/RohanGupta15/tiffin`
  2. Edit port mappings, and provide a path to the config.js file in `docker-compose.yml`
  3. `cd tiffin`, then run `docker compose up -d --build` to start.

## 🎨 Customization

Everything lives in `config.js`. While `npm start` is running, saving a file reloads the extension.

| Option | What it does |
| --- | --- |
| `name` | Shown in the greeting. Leave `''` to drop it. |
| `greetingMorning` / `Afternoon` / `Evening` / `Night` | Greeting text by time of day. |
| `twelveHourFormat` | `true` for a 12-hour clock with am/pm. |
| `dayWeight` / `dayWeightRange` | Clock weight follows the time of day, between `[lightest, heaviest]` (100–900). `false` keeps it fixed. |
| `openInNewTab` | Open links (and searches) in a new tab instead of this one. |
| `imageBackground` | Use `assets/background.jpg` as a wallpaper with frosted tiles. |
| `bentoLayout` | `'bento'` (tiles + lists), `'lists'` (all lists), `'buttons'` (all tiles). |
| `theme` | `'auto'` follows the OS; `'dark'` or `'light'` forces one. |
| `accentDark` / `accentLight` | The single accent colour (clock colon, focus rings, day dot) per theme. |
| `searchUrl` | Fallback search URL (`%s` = query) when Tiffin runs as a plain web page rather than the extension. |
| `weatherUnit` | `'C'` or `'F'`. |
| `trackLocation` | Use the browser's location for weather; otherwise `defaultLatitude` / `defaultLongitude`. |
| `locationName` | Label under the weather. `''` hides it. |

### 🏷️ Tiles

`firstButtonsContainer` (and `secondButtonsContainer` for the `buttons` layout). Icons are any [Lucide](https://lucide.dev) name from v0.469. The first nine tiles get the `1`–`9` shortcuts.

```js
firstButtonsContainer: [
	{ name: 'GitHub', icon: 'github', link: 'https://github.com/' },
	{ name: 'Mail', icon: 'mail', link: 'https://mail.protonmail.com/' },
],
```

### 📑 Lists

`firstlistsContainer` (and `secondListsContainer` for the `lists` layout). Each list has a title, an icon and any number of links.

```js
firstlistsContainer: [
	{
		title: 'Listen',
		icon: 'music',
		links: [
			{ name: 'Inspirational', link: 'https://www.youtube.com/' },
			{ name: 'Classic', link: 'https://www.youtube.com/' },
		],
	},
],
```

### 💛 Colors and type

Colours are CSS variables at the top of `app.css`: light theme on `:root`, dark on `:root[data-theme='dark']`. Fonts are declared with `@font-face` at the very top and live in `assets/fonts/` (SIL Open Font License).

## 🍱 Credits

Tiffin is built on [Bento](https://github.com/migueravila/Bento) by [Miguel Ávila](https://github.com/migueravila) and its contributors, and stays under the same [GPL-3.0](License) licence. Fonts: Imbue, Petrona, Onest and Reddit Mono (SIL Open Font License). Icons: [Lucide](https://lucide.dev). Weather: [Open-Meteo](https://open-meteo.com).
