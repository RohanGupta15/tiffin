// ╔╦╗╦╔═╗╔═╗╦╔╗╔
//  ║ ║╠╣ ╠╣ ║║║║
//  ╩ ╩╚  ╚  ╩╝╚╝
// ┌─┐┌─┐┌┐┌┌─┐┬┌─┐┬ ┬┬─┐┌─┐┌┬┐┬┌─┐┌┐┌
// │  │ ││││├┤ ││ ┬│ │├┬┘├─┤ │ ││ ││││
// └─┘└─┘┘└┘└  ┴└─┘└─┘┴└─┴ ┴ ┴ ┴└─┘┘└┘

const CONFIG = {
	// ┌┐ ┌─┐┌─┐┬┌─┐┌─┐
	// ├┴┐├─┤└─┐││  └─┐
	// └─┘┴ ┴└─┘┴└─┘└─┘

	// These are the defaults for a new install. Everything here except the links can also
	// be changed on the page (gear button or ,); those choices override this file.

	// General
	name: '', // asked on the first new tab
	showGreeting: true,
	imageBackground: false, // uses assets/background.jpg
	openInNewTab: false,
	twelveHourFormat: false,
	dayWeight: true, // clock gets thinner at night and bolder towards midday
	dayWeightRange: [140, 520], // [lightest, heaviest], any of 100–900

	// Greetings
	greetingMorning: 'Good morning,',
	greetingAfternoon: 'Good afternoon,',
	greetingEvening: 'Good evening,',
	greetingNight: 'Still up,',

	// Layout
	bentoLayout: 'bento', // 'bento', 'lists', 'buttons'

	// Theme
	theme: 'auto', // 'auto' (follow the OS), 'dark', 'light'. The toggle (or T) overrides it until reset.
	accent: 'indigo', // 'indigo', 'teal', 'green', 'amber', 'rose', 'graphite'

	// Search: Firefox's default engine is used when running as the extension.
	// This template is the fallback when Tiffin runs as a plain web page.
	searchUrl: 'https://duckduckgo.com/?q=%s',

	// Weather (Open-Meteo, no API key). Hidden until a city is chosen in settings.
	weatherUnit: 'C', // 'C', 'F'
	city: '',
	latitude: null,
	longitude: null,

	// ┌┐ ┬ ┬┌┬┐┌┬┐┌─┐┌┐┌┌─┐
	// ├┴┐│ │ │  │ │ ││││└─┐
	// └─┘└─┘ ┴  ┴ └─┘┘└┘└─┘
	// Icons: any name from https://lucide.dev (v0.469). The first nine get 1–9 shortcuts.

	firstButtonsContainer: [
		{ name: 'GitHub', icon: 'github', link: 'https://github.com/' },
		{ name: 'Gmail', icon: 'mail', link: 'https://mail.google.com/' },
		{ name: 'Calendar', icon: 'calendar', link: 'https://calendar.google.com/' },
		{ name: 'YouTube', icon: 'youtube', link: 'https://www.youtube.com/' },
		{ name: 'Reddit', icon: 'message-circle', link: 'https://www.reddit.com/' },
		{ name: 'Wikipedia', icon: 'book-open', link: 'https://en.wikipedia.org/' },
	],

	secondButtonsContainer: [
		{ name: 'Maps', icon: 'map', link: 'https://www.google.com/maps' },
		{ name: 'Drive', icon: 'hard-drive', link: 'https://drive.google.com/' },
		{ name: 'News', icon: 'newspaper', link: 'https://news.ycombinator.com/' },
		{ name: 'Music', icon: 'headphones', link: 'https://open.spotify.com/' },
		{ name: 'Shop', icon: 'shopping-bag', link: 'https://www.amazon.com/' },
		{ name: 'Figma', icon: 'figma', link: 'https://www.figma.com/' },
	],

	// ┬  ┬┌─┐┌┬┐┌─┐
	// │  │└─┐ │ └─┐
	// ┴─┘┴└─┘ ┴ └─┘
	// Lists take any number of links.

	firstlistsContainer: [
		{
			title: 'Read',
			icon: 'book-open',
			links: [
				{ name: 'Hacker News', link: 'https://news.ycombinator.com/' },
				{ name: 'The Verge', link: 'https://www.theverge.com/' },
				{ name: 'Wikipedia', link: 'https://en.wikipedia.org/' },
				{ name: 'Medium', link: 'https://medium.com/' },
			],
		},
		{
			title: 'Watch',
			icon: 'tv',
			links: [
				{ name: 'YouTube', link: 'https://www.youtube.com/' },
				{ name: 'Netflix', link: 'https://www.netflix.com/' },
				{ name: 'Twitch', link: 'https://www.twitch.tv/' },
				{ name: 'Prime Video', link: 'https://www.primevideo.com/' },
			],
		},
	],

	secondListsContainer: [
		{
			title: 'Work',
			icon: 'briefcase',
			links: [
				{ name: 'Docs', link: 'https://docs.google.com/' },
				{ name: 'Notion', link: 'https://www.notion.so/' },
				{ name: 'Slack', link: 'https://app.slack.com/' },
				{ name: 'LinkedIn', link: 'https://www.linkedin.com/' },
			],
		},
		{
			title: 'Code',
			icon: 'code',
			links: [
				{ name: 'MDN', link: 'https://developer.mozilla.org/' },
				{ name: 'Stack Overflow', link: 'https://stackoverflow.com/' },
				{ name: 'Can I use', link: 'https://caniuse.com/' },
				{ name: 'npm', link: 'https://www.npmjs.com/' },
			],
		},
	],
};
