// ┌┬┐┬ ┬┌─┐┌┬┐┌─┐  ┬┌┐┌┬┌┬┐
//  │ ├─┤├┤ │││├┤   │││││ │
//  ┴ ┴ ┴└─┘┴ ┴└─┘  ┴┘└┘┴ ┴
// Runs in <head> before first paint, so the page never flashes the wrong theme.

const THEME_KEY = 'bento-theme';

const autoTheme = () => {
	if (CONFIG.theme === 'dark' || CONFIG.theme === 'light') return CONFIG.theme;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const savedTheme = () => {
	try {
		const saved = localStorage.getItem(THEME_KEY);
		return saved === 'dark' || saved === 'light' ? saved : null;
	} catch (e) {
		return null;
	}
};

(() => {
	const root = document.documentElement;
	root.dataset.theme = savedTheme() || autoTheme();
	if (CONFIG.accentDark) root.style.setProperty('--accent-dark', CONFIG.accentDark);
	if (CONFIG.accentLight) root.style.setProperty('--accent-light', CONFIG.accentLight);
	if (CONFIG.imageBackground) root.classList.add('has-image');
})();
