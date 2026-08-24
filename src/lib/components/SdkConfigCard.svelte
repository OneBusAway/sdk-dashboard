<script>
	import WorkflowBadge from './WorkflowBadge.svelte';
	import RecentRuns from './RecentRuns.svelte';
	import Icon from './Icon.svelte';
	import { relativeTime } from '$lib/time.js';
	import { now } from '$lib/now.svelte.js';

	/**
	 * @typedef {{
	 *   repo: string,
	 *   runs: Array<{
	 *     id: number, name?: string, conclusion?: string | null, status?: string,
	 *     html_url?: string, updated_at?: string, head_branch?: string
	 *   }>
	 * }} Props
	 */
	/** @type {Props} */
	let { repo, runs } = $props();

	const taggedRuns = $derived(runs.map((r) => ({ ...r, source: repo })));
</script>

<div
	class="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
>
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2.5">
			<span class="flex h-6 w-6 items-center justify-center rounded-md bg-oba-50 text-oba-700 dark:bg-oba-500/10 dark:text-oba-400">
				<Icon name="git-branch" class="h-3.5 w-3.5" />
			</span>
			<div>
				<h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{repo}</h3>
				<p class="text-xs text-zinc-400 dark:text-zinc-500">Source of truth · triggers all SDK generation</p>
			</div>
		</div>
		<a
			href={`https://github.com/${repo}`}
			target="_blank"
			rel="noreferrer"
			class="text-zinc-300 transition hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
			title="View {repo} repository"
		>
			<Icon name="external-link" class="h-3.5 w-3.5" />
		</a>
	</div>

	<div class="flex flex-wrap items-center gap-x-6 gap-y-2">
		<div class="min-w-[10rem] flex-1">
			<WorkflowBadge label="Latest run" run={runs[0]} />
		</div>
		{#if runs[0]?.updated_at}
			<span class="text-xs text-zinc-400 dark:text-zinc-500">{relativeTime(runs[0].updated_at, now.value)}</span>
		{/if}
	</div>

	<RecentRuns runs={taggedRuns} showSourceFilter={false} />
</div>
