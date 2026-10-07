// ┬ ┬┌┬┐┬┬
// │ │ │ ││
// └─┘ ┴ ┴┴─┘
// Small DOM helpers shared by the other scripts.

// h('a', { class: 'tile', href }, child, ...) builds an element without innerHTML.
const h = (tag, props = {}, ...children) => {
	const el = document.createElement(tag);
	for (const [key, value] of Object.entries(props)) {
		if (value == null || value === false) continue;
		if (key === 'class') el.className = value;
		else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
		else el.setAttribute(key, value === true ? '' : value);
	}
	el.append(...children.flat().filter((c) => c != null && c !== false));
	return el;
};

// icon('shopping-bag') → Lucide <svg>. Unknown names fall back to a link icon.
const icon = (name, size = 22, strokeWidth = 1.5) => {
	const key = String(name)
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	const svg = lucide.createElement(lucide.icons[key] || lucide.icons.Link);
	svg.setAttribute('width', size);
	svg.setAttribute('height', size);
	svg.setAttribute('stroke-width', strokeWidth);
	svg.setAttribute('aria-hidden', 'true');
	return svg;
};

const domainOf = (url) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch (e) {
		return '';
	}
};

const linkTargetProps = () => (CONFIG.openInNewTab ? { target: '_blank', rel: 'noopener' } : {});

const openLink = (url) => {
	if (CONFIG.openInNewTab) window.open(url, '_blank', 'noopener');
	else window.location.href = url;
};
