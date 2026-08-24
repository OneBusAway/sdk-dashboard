<script>
	import Icon from './Icon.svelte';

	/**
	 * @typedef {{
	 *   label: string,
	 *   run: { conclusion?: string | null, status?: string, html_url?: string } | null | undefined
	 * }} Props
	 */
	/** @type {Props} */
	let { label, run } = $props();

	/** @type {Record<string, string>} */
	const STYLES = {
		success:
			'bg-oba-50 text-oba-700 ring-oba-600/20 dark:bg-oba-500/10 dark:text-oba-400 dark:ring-oba-400/20',
		failure: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20',
		cancelled:
			'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600/30',
		skipped:
			'bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-500 dark:ring-zinc-600/30',
		in_progress:
			'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20',
		queued:
			'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20',
		unknown:
			'bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-500 dark:ring-zinc-600/30'
	};

	/** @type {Record<string, string>} */
	const ICON = {
		success: 'check',
		failure: 'x',
		cancelled: 'x',
		skipped: 'skip-forward',
		in_progress: 'loader',
		queued: 'clock',
		unknown: 'clock'
	};

	/** @type {Record<string, string>} */
	const TEXT = {
		success: 'Pass',
		failure: 'Failed',
		cancelled: 'Cancelled',
		skipped: 'Skipped',
		in_progress: 'Running',
		queued: 'Queued',
		unknown: 'No data'
	};

	const state = $derived(run ? (run.conclusion ?? run.status ?? 'unknown') : 'unknown');
	const styleClass = $derived(STYLES[state] ?? STYLES.unknown);
	const icon = $derived(ICON[state] ?? 'clock');
	const text = $derived(TEXT[state] ?? state);
</script>

<div class="flex items-center justify-between gap-2 text-sm">
	<span class="text-zinc-500 dark:text-zinc-400">{label}</span>
	{#if run?.html_url}
		<a
			href={run.html_url}
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition hover:brightness-95 {styleClass}"
		>
			<Icon
				name={icon}
				class="h-3 w-3 {state === 'in_progress' ? 'animate-spin' : state === 'queued' ? 'animate-pulse' : ''}"
			/>
			{text}
		</a>
	{:else}
		<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset {styleClass}">
			<Icon
				name={icon}
				class="h-3 w-3 {state === 'in_progress' ? 'animate-spin' : state === 'queued' ? 'animate-pulse' : ''}"
			/>
			{text}
		</span>
	{/if}
</div>
