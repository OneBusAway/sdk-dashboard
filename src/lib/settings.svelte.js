const MIN_MINUTES = 1;
const MAX_MINUTES = 60;
const DEFAULT_MINUTES = 5;

/** @param {number} value */
function clamp(value) {
	return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(value) || DEFAULT_MINUTES));
}

function readStored() {
	try {
		const stored = localStorage.getItem('refreshIntervalMinutes');
		return stored ? clamp(Number(stored)) : DEFAULT_MINUTES;
	} catch {
		return DEFAULT_MINUTES;
	}
}

function createSettingsStore() {
	let refreshIntervalMinutes = $state(typeof localStorage !== 'undefined' ? readStored() : DEFAULT_MINUTES);

	/** @param {number} minutes */
	function setRefreshIntervalMinutes(minutes) {
		refreshIntervalMinutes = clamp(minutes);
		try {
			localStorage.setItem('refreshIntervalMinutes', String(refreshIntervalMinutes));
		} catch {
			// Private browsing / storage disabled — setting just won't persist.
		}
	}

	return {
		get refreshIntervalMinutes() {
			return refreshIntervalMinutes;
		},
		setRefreshIntervalMinutes,
		MIN_MINUTES,
		MAX_MINUTES
	};
}

export const settings = createSettingsStore();
