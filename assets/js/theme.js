//  ┌┬┐┬ ┬┌─┐┌┬┐┌─┐
//  │ ├─┤├┤ │││├┤
//  ┴ ┴ ┴└─┘┴ ┴└─┘
// Theme toggle. The initial theme is set in theme-init.js before paint.
// Toggling saves an override; toggling back to what the OS wants clears it,
// so the page follows the OS again.

const themeButton = document.getElementById('themeButton');

const currentTheme = () => document.documentElement.dataset.theme;

const renderThemeButton = () => {
	const dark = currentTheme() === 'dark';
	themeButton.replaceChildren(icon(dark ? 'sun' : 'moon', 18, 1.75));
	themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
};

const applyTheme = (theme) => {
	document.documentElement.dataset.theme = theme;
	renderThemeButton();
};

const toggleTheme = () => {
	const next = currentTheme() === 'dark' ? 'light' : 'dark';
	try {
		if (next === autoTheme()) localStorage.removeItem(THEME_KEY);
		else localStorage.setItem(THEME_KEY, next);
	} catch (e) {
		// Storage unavailable; the toggle still works for this tab.
	}
	applyTheme(next);
};

themeButton.addEventListener('click', toggleTheme);

// Follow OS changes live, unless the user has overridden it.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
	if (!savedTheme()) applyTheme(autoTheme());
});

// Another tab toggled the theme.
window.addEventListener('storage', (e) => {
	if (e.key === THEME_KEY) applyTheme(savedTheme() || autoTheme());
});

renderThemeButton();

// Enable colour transitions only after the first paint, so loading never animates.
requestAnimationFrame(() =>
	requestAnimationFrame(() => document.documentElement.classList.add('theme-ready'))
);
