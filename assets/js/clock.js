// ┌─┐┬  ┌─┐┌─┐┬┌─
// │  │  │ ││  ├┴┐
// └─┘┴─┘└─┘└─┘┴ ┴
// Clock, date, greeting and the day-progress line. Updates on the minute.

const greetingFor = (hour) => {
	if (hour >= 23 || hour < 5) return CONFIG.greetingNight;
	if (hour < 12) return CONFIG.greetingMorning;
	if (hour < 17) return CONFIG.greetingAfternoon;
	return CONFIG.greetingEvening;
};

// Day weight: the clock's variable weight follows the day on a cosine curve,
// thinnest at 01:00 and heaviest at 13:00, so the type itself shows the time of day.
const applyDayWeight = (progress) => {
	const [light, heavy] = CONFIG.dayWeight ? CONFIG.dayWeightRange || [140, 520] : [300, 300];
	const curve = (1 - Math.cos(2 * Math.PI * (progress - 1 / 24))) / 2;
	const weight = Math.round(light + (heavy - light) * curve);
	document.documentElement.style.setProperty('--clock-wght', weight);
	if (CONFIG.dayWeight) {
		document.getElementById('clock').title = `Weight ${weight}: thinnest at 1 am, heaviest at 1 pm`;
	}
};

const renderClock = () => {
	const now = new Date();
	let hours = now.getHours();
	const minutes = now.getMinutes();

	let ampm = '';
	if (CONFIG.twelveHourFormat) {
		ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12 || 12;
	}

	document.getElementById('hours').textContent = CONFIG.twelveHourFormat
		? String(hours)
		: String(hours).padStart(2, '0');
	document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
	document.getElementById('ampm').textContent = ampm;

	const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
	const dayMonth = now.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
	document.getElementById('date').textContent = `${weekday} · ${dayMonth}`;

	const greeting = greetingFor(now.getHours()).trim();
	document.getElementById('greeting').textContent = CONFIG.name
		? `${greeting} ${CONFIG.name}.`
		: greeting.replace(/[,\s]*$/, '.');

	const progress = (now.getHours() * 60 + minutes) / 1440;
	applyDayWeight(progress);

	const percent = `${(progress * 100).toFixed(2)}%`;
	document.getElementById('dayFill').style.width = percent;
	document.getElementById('dayDot').style.left = percent;
	document.getElementById('dayLabel').textContent = `${Math.round(progress * 100)}% of today`;
};

const scheduleClock = () => {
	renderClock();
	const now = new Date();
	const msToNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
	setTimeout(scheduleClock, msToNextMinute + 50);
};

scheduleClock();

// Timers are throttled in background tabs; catch up when the tab is shown again.
document.addEventListener('visibilitychange', () => {
	if (!document.hidden) renderClock();
});
