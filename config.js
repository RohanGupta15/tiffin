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

	// General
	name: 'Rohan',
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
	accentDark: '#8FA8FF', // accent on the dark theme
	accentLight: '#4F6BED', // accent on the light theme

	// Search: Firefox's default engine is used when running as the extension.
	// This template is the fallback when Tiffin runs as a plain web page.
	searchUrl: 'https://duckduckgo.com/?q=%s',

	// Weather (Open-Meteo, no API key needed)
	weatherUnit: 'C', // 'C', 'F'
	trackLocation: true, // If false or an error occurs, the lat/lon below are used
	defaultLatitude: '37.775',
	defaultLongitude: '-122.419',
	locationName: 'San Francisco', // Label under the weather; '' to hide

	// ┌┐ ┬ ┬┌┬┐┌┬┐┌─┐┌┐┌┌─┐
	// ├┴┐│ │ │  │ │ ││││└─┐
	// └─┘└─┘ ┴  ┴ └─┘┘└┘└─┘
	// Icons: any name from https://lucide.dev (v0.469). The first nine get 1–9 shortcuts.

	firstButtonsContainer: [
		{ name: 'GitHub', icon: 'github', link: 'https://github.com/' },
		{ name: 'Mail', icon: 'mail', link: 'https://mail.protonmail.com/' },
		{ name: 'Todoist', icon: 'square-check', link: 'https://todoist.com' },
		{ name: 'Calendar', icon: 'calendar', link: 'https://calendar.google.com/calendar/r' },
		{ name: 'Reddit', icon: 'glasses', link: 'https://reddit.com' },
		{ name: 'Odysee', icon: 'tv', link: 'https://odysee.com/' },
	],

	secondButtonsContainer: [
		{ name: 'Music', icon: 'headphones', link: 'https://open.spotify.com' },
		{ name: 'Twitter', icon: 'twitter', link: 'https://twitter.com/' },
		{ name: 'Discord', icon: 'bot', link: 'https://discord.com/app' },
		{ name: 'Amazon', icon: 'shopping-bag', link: 'https://amazon.com/' },
		{ name: 'Hashnode', icon: 'pen-tool', link: 'https://hashnode.com/' },
		{ name: 'Figma', icon: 'figma', link: 'https://figma.com/' },
	],

	// ┬  ┬┌─┐┌┬┐┌─┐
	// │  │└─┐ │ └─┐
	// ┴─┘┴└─┘ ┴ └─┘
	// Lists take any number of links.

	firstlistsContainer: [
		{
			title: 'Listen',
			icon: 'music',
			links: [
				{ name: 'Inspirational', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
				{ name: 'Classic', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
				{ name: 'Oldies', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
				{ name: 'Rock', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
			],
		},
		{
			title: 'Work',
			icon: 'coffee',
			links: [
				{ name: 'LinkedIn', link: 'https://www.linkedin.com' },
				{ name: 'Dribbble', link: 'https://www.dribbble.com' },
				{ name: 'Trello', link: 'https://www.trello.com' },
				{ name: 'Slack', link: 'https://www.slack.com' },
			],
		},
	],

	secondListsContainer: [
		{
			title: 'Read',
			icon: 'binary',
			links: [
				{ name: 'Spotify', link: 'https://www.spotify.com' },
				{ name: 'Reddit', link: 'https://www.reddit.com' },
				{ name: 'Hashnode', link: 'https://www.hashnode.com' },
				{ name: 'Pocket', link: 'https://www.pocket.com' },
			],
		},
		{
			title: 'Code',
			icon: 'github',
			links: [
				{ name: 'Front', link: 'https://www.reddit.com/r/Frontend/' },
				{ name: 'Rust', link: 'https://www.reddit.com/r/rust/' },
				{ name: 'Go', link: 'https://www.reddit.com/r/golang/' },
				{ name: 'Repos', link: 'https://github.com/migueravila' },
			],
		},
	],
};
