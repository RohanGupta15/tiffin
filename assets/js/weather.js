// ┬ ┬┌─┐┌─┐┌┬┐┬ ┬┌─┐┬─┐
// │││├┤ ├─┤ │ ├─┤├┤ ├┬┘
// └┴┘└─┘┴ ┴ ┴ ┴ ┴└─┘┴└─
// Weather from Open-Meteo (free, no API key) for the city chosen in settings.
// Cached for 30 minutes so new tabs show it instantly instead of waiting on the network.

const WEATHER_KEY = 'bento-weather';
const WEATHER_MAX_AGE = 30 * 60 * 1000;

// WMO weather codes → [description, day icon, night icon]
const WEATHER_CODES = [
	[[0], 'Clear sky', 'sun', 'moon'],
	[[1], 'Mostly clear', 'sun', 'moon'],
	[[2], 'Partly cloudy', 'cloud-sun', 'cloud-moon'],
	[[3], 'Overcast', 'cloud', 'cloud'],
	[[45, 48], 'Fog', 'cloud-fog', 'cloud-fog'],
	[[51, 53, 55, 56, 57], 'Drizzle', 'cloud-drizzle', 'cloud-drizzle'],
	[[61, 63, 65, 66, 67], 'Rain', 'cloud-rain', 'cloud-rain'],
	[[80, 81, 82], 'Showers', 'cloud-rain', 'cloud-rain'],
	[[71, 73, 75, 77, 85, 86], 'Snow', 'cloud-snow', 'cloud-snow'],
	[[95, 96, 99], 'Thunderstorm', 'cloud-lightning', 'cloud-lightning'],
];

const describeWeather = (code, isDay) => {
	const match = WEATHER_CODES.find(([codes]) => codes.includes(code));
	if (!match) return { text: '', iconName: isDay ? 'sun' : 'moon' };
	return { text: match[1], iconName: isDay ? match[2] : match[3] };
};

const renderWeather = (data) => {
	const { text, iconName } = describeWeather(data.code, data.isDay);
	document.getElementById('weatherIcon').replaceChildren(icon(iconName, 22, 1.5));
	document.getElementById('weatherTemp').textContent = `${Math.round(data.temp)}°`;
	document.getElementById('weatherDesc').textContent = text;
	document.getElementById('weatherMeta').textContent = [
		CONFIG.city,
		`H ${Math.round(data.max)}° L ${Math.round(data.min)}°`,
	]
		.filter(Boolean)
		.join(' · ');
	document.getElementById('weather').hidden = false;
};

const readWeatherCache = () => {
	try {
		const cached = JSON.parse(localStorage.getItem(WEATHER_KEY));
		const same = cached && cached.unit === CONFIG.weatherUnit && cached.lat === CONFIG.latitude && cached.lon === CONFIG.longitude;
		return same ? cached : null;
	} catch (e) {
		return null;
	}
};

const fetchWeather = async (latitude, longitude) => {
	const unit = CONFIG.weatherUnit === 'F' ? 'fahrenheit' : 'celsius';
	const url =
		'https://api.open-meteo.com/v1/forecast' +
		`?latitude=${latitude}&longitude=${longitude}` +
		'&current=temperature_2m,weather_code,is_day' +
		'&daily=temperature_2m_max,temperature_2m_min' +
		`&temperature_unit=${unit}&timezone=auto&forecast_days=1`;

	const response = await fetch(url);
	if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
	const json = await response.json();

	const data = {
		temp: json.current.temperature_2m,
		code: json.current.weather_code,
		isDay: json.current.is_day === 1,
		max: json.daily.temperature_2m_max[0],
		min: json.daily.temperature_2m_min[0],
		unit: CONFIG.weatherUnit,
		lat: latitude,
		lon: longitude,
		at: Date.now(),
	};
	try {
		localStorage.setItem(WEATHER_KEY, JSON.stringify(data));
	} catch (e) {
		// Storage unavailable (private window); weather still renders.
	}
	return data;
};

const hasCity = () => Number.isFinite(CONFIG.latitude) && Number.isFinite(CONFIG.longitude);

// The city's coordinates go to Open-Meteo only after the user agreed in Firefox's
// optional "location" data permission (asked when they first search for a city).
const hasLocationConsent = async () => {
	if (typeof browser === 'undefined' || !browser.permissions) return true; // plain web page
	const granted = await browser.permissions.getAll();
	return !granted.data_collection || granted.data_collection.includes('locationInfo');
};

(async () => {
	if (!hasCity()) return;
	const cached = readWeatherCache();
	if (cached) renderWeather(cached);
	if (cached && Date.now() - cached.at < WEATHER_MAX_AGE) return;

	try {
		if (!(await hasLocationConsent())) return;
		renderWeather(await fetchWeather(CONFIG.latitude, CONFIG.longitude));
	} catch (err) {
		console.error('Weather unavailable:', err);
	}
})();
