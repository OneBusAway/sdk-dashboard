<script>
	import { relativeTime } from '$lib/time.js';
	import { now } from '$lib/now.svelte.js';
	import { settings } from '$lib/settings.svelte.js';
	import Icon from './Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import logo from '$lib/assets/oba-logo.png';

	/**
	 * @typedef {{
	 *   overallHealthy: boolean,
	 *   lastUpdated: Date | null,
	 *   lastFullGenerate: { conclusion?: string | null, updated_at?: string, html_url?: string } | null,
	 *   loading: boolean,
	 *   onRefresh: () => void
	 * }} Props
	 */
	/** @type {Props} */
	let { overallHealthy, lastUpdated, lastFullGenerate, loading, onRefresh } = $props();
</script>

<header
	class="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
>
	<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
		<div class="flex items-center gap-3">
			<img src={logo} alt="OneBusAway" class="h-9 w-9 rounded-lg shadow-sm" width="36" height="36" />
			<div>
				<h1 class="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
					OneBusAway SDK Dashboard
				</h1>
				<p class="text-xs text-zinc-500 dark:text-zinc-400">6 targets · staging &amp; production</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			{#if lastFullGenerate}
				<a
					href={lastFullGenerate.html_url}
					target="_blank"
					rel="noreferrer"
					class="hidden text-xs text-zinc-500 hover:text-zinc-700 hover:underline sm:inline dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					Last full generate {relativeTime(lastFullGenerate.updated_at, now.value)}
				</a>
			{/if}

			<div class="flex items-center gap-1 rounded-full bg-zinc-100 pl-1 dark:bg-zinc-800">
				<button
					type="button"
					onclick={onRefresh}
					disabled={loading}
					class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-zinc-500 transition hover:bg-white hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
					title={loading ? 'Refreshing…' : 'Refresh now'}
				>
					<Icon name="refresh-cw" class="h-3.5 w-3.5 {loading ? 'animate-spin' : ''}" />
					{relativeTime(lastUpdated, now.value)}
				</button>
				<label
					class="flex items-center gap-1 border-l border-zinc-200 pr-2 pl-1.5 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
					title="Auto-refresh interval (1–60 min)"
				>
					<input
						type="number"
						min={settings.MIN_MINUTES}
						max={settings.MAX_MINUTES}
						value={settings.refreshIntervalMinutes}
						onchange={(e) => settings.setRefreshIntervalMinutes(Number(e.currentTarget.value))}
						class="w-8 rounded bg-transparent text-right text-zinc-700 outline-none focus:bg-white dark:text-zinc-200 dark:focus:bg-zinc-900"
					/>
					min
				</label>
			</div>

			<span
				class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset {overallHealthy
					? 'bg-oba-50 text-oba-700 ring-oba-600/20 dark:bg-oba-500/10 dark:text-oba-400 dark:ring-oba-400/20'
					: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20'}"
			>
				<span class="relative flex h-2 w-2">
					{#if overallHealthy}
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-oba-400 opacity-75"
						></span>
					{/if}
					<span class="relative inline-flex h-2 w-2 rounded-full {overallHealthy ? 'bg-oba-500' : 'bg-red-500'}"
					></span>
				</span>
				{overallHealthy ? 'All systems green' : 'Attention needed'}
			</span>

			<ThemeToggle />
		</div>
	</div>
</header>
