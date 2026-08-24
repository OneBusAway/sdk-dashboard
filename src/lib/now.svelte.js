function createNowStore() {
	let value = $state(Date.now());

	if (typeof window !== 'undefined') {
		setInterval(() => {
			value = Date.now();
		}, 30_000);
	}

	return {
		get value() {
			return value;
		}
	};
}

/**
 * Ticks every 30s so any "X ago" text re-renders on its own instead of
 * freezing at whatever it read during the last unrelated prop change.
 */
export const now = createNowStore();
