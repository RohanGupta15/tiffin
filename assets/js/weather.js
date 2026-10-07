// ┬ ┬┌─┐┌─┐┌┬┐┬ ┬┌─┐┬─┐
// │││├┤ ├─┤ │ ├─┤├┤ ├┬┘
// └┴┘└─┘┴ ┴ ┴ ┴ ┴└─┘┴└─
// Weather from Open-Meteo (free, no API key). Cached for 30 minutes so new tabs
// show it instantly instead of waiting on the network.

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
		CONFIG.locationName,
		`H ${Math.round(data.max)}° L ${Math.round(data.min)}°`,
	]
		.filter(Boolean)
		.join(' · ');
	document.getElementById('weather').hidden = false;
};

const readWeatherCache = () => {
	try {
		const cached = JSON.parse(localStorage.getItem(WEATHER_KEY));
		return cached && cached.unit === CONFIG.weatherUnit ? cached : null;
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
		at: Date.now(),
	};
	try {
		localStorage.setItem(WEATHER_KEY, JSON.stringify(data));
	} catch (e) {
		// Storage unavailable (private window); weather still renders.
	}
	return data;
};

const getPosition = () =>
	new Promise((resolve) => {
		const fallback = () => resolve([CONFIG.defaultLatitude, CONFIG.defaultLongitude]);
		if (!CONFIG.trackLocation || !navigator.geolocation) return fallback();
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve([pos.coords.latitude.toFixed(3), pos.coords.longitude.toFixed(3)]),
			fallback,
			{ timeout: 8000, maximumAge: WEATHER_MAX_AGE }
		);
	});

(async () => {
	const cached = readWeatherCache();
	if (cached) renderWeather(cached);
	if (cached && Date.now() - cached.at < WEATHER_MAX_AGE) return;

	try {
		const [latitude, longitude] = await getPosition();
		renderWeather(await fetchWeather(latitude, longitude));
	} catch (err) {
		console.error('Weather unavailable:', err);
	}
})();
