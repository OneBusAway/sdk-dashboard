/**
 * @param {string | Date | null | undefined} value
 * @param {number} [nowMs] - pass `now.value` from `$lib/now.svelte.js` in a
 *   template expression so the result re-renders as time passes, instead of
 *   only when some other prop happens to change.
 */
export function relativeTime(value, nowMs = Date.now()) {
	if (!value) return 'never';
	const date = value instanceof Date ? value : new Date(value);
	const diffMs = nowMs - date.getTime();
	const diffSec = Math.round(diffMs / 1000);

	if (diffSec < 60) return 'just now';
	const diffMin = Math.round(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.round(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	const diffDay = Math.round(diffHr / 24);
	return `${diffDay}d ago`;
}
