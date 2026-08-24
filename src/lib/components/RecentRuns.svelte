<script>
	import { relativeTime } from '$lib/time.js';
	import { now } from '$lib/now.svelte.js';
	import Icon from './Icon.svelte';

	/**
	 * @typedef {{
	 *   runs: Array<{
	 *     id: number, name?: string, conclusion?: string | null, status?: string,
	 *     html_url?: string, updated_at?: string, head_branch?: string, source: string
	 *   }>,
	 *   showSourceFilter?: boolean
	 * }} Props
	 */
	/** @type {Props} */
	let { runs, showSourceFilter = true } = $props();

	const STATUS_OPTIONS = [
		{ value: 'all', label: 'All' },
		{ value: 'failure', label: 'Failed' },
		{ value: 'success', label: 'Passed' },
		{ value: 'in_progress', label: 'Running' }
	];

	/** @type {Record<string, string>} */
	const DOT_COLOR = {
		success: 'bg-oba-500',
		failure: 'bg-red-500',
		cancelled: 'bg-zinc-400',
		skipped: 'bg-zinc-300 dark:bg-zinc-600',
		in_progress: 'bg-yellow-500',
		queued: 'bg-yellow-400'
	};

	let open = $state(false);
	let statusFilter = $state('all');
	let sourceFilter = $state('all');

	const filtered = $derived(
		runs
			.filter((r) => sourceFilter === 'all' || r.source === sourceFilter)
			.filter((r) => statusFilter === 'all' || (r.conclusion ?? r.status) === statusFilter)
			.sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())
			.slice(0, 15)
	);
</script>

<div class="mt-1 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
	>
		<span>Recent workflow runs ({runs.length})</span>
		<Icon name="arrow-up-right" class="h-3 w-3 rotate-90 transition-transform {open ? '!rotate-45' : ''}" />
	</button>

	{#if open}
		<div class="mt-2.5 flex flex-wrap items-center gap-1.5">
			{#each STATUS_OPTIONS as opt (opt.value)}
				<button
					type="button"
					onclick={() => (statusFilter = opt.value)}
					class="rounded-full px-2 py-0.5 text-[11px] font-medium transition {statusFilter === opt.value
						? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
						: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}"
				>
					{opt.label}
				</button>
			{/each}
			{#if showSourceFilter}
				<select
					bind:value={sourceFilter}
					class="ml-auto rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
				>
					<option value="all">Staging + Prod</option>
					<option value="staging">Staging</option>
					<option value="production">Production</option>
				</select>
			{/if}
		</div>

		<ul class="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
			{#each filtered as run (run.source + run.id)}
				{@const state = run.conclusion ?? run.status ?? ''}
				<li class="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
					<span class="relative flex h-1.5 w-1.5 shrink-0">
						{#if state === 'in_progress'}
							<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"
							></span>
						{/if}
						<span class="relative inline-flex h-1.5 w-1.5 rounded-full {DOT_COLOR[state] ?? 'bg-zinc-300'}"></span>
					</span>
					<a
						href={run.html_url}
						target="_blank"
						rel="noreferrer"
						class="min-w-0 flex-1 truncate text-zinc-700 hover:underline dark:text-zinc-300"
					>
						{#if showSourceFilter}<span class="text-zinc-400 dark:text-zinc-500">{run.source}</span>{/if}
						{run.name}
						<span class="text-zinc-400 dark:text-zinc-500">· {run.head_branch}</span>
					</a>
					<span class="shrink-0 text-zinc-400 dark:text-zinc-500">{relativeTime(run.updated_at, now.value)}</span>
				</li>
			{:else}
				<li class="py-1 text-xs text-zinc-400 dark:text-zinc-500">No runs match this filter.</li>
			{/each}
		</ul>
	{/if}
</div>
