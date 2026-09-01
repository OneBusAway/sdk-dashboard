<script>
	import WorkflowBadge from './WorkflowBadge.svelte';
	import DiffBadge from './DiffBadge.svelte';
	import RecentRuns from './RecentRuns.svelte';
	import Icon from './Icon.svelte';
	import { relativeTime } from '$lib/time.js';
	import { now } from '$lib/now.svelte.js';

	/** @typedef {import('$lib/dashboard.svelte.js').TargetData & { latestVersion: string | null }} Props */
	/** @type {Props} */
	let {
		name,
		color,
		staging,
		production,
		stagingRuns,
		productionRuns,
		stagingCiRuns,
		productionCiRuns,
		diff,
		stagingHeadCommit,
		latestVersion,
		registry,
		error
	} = $props();

	const taggedRuns = $derived([
		...stagingRuns.map((/** @type {any} */ r) => ({ ...r, source: 'staging' })),
		...productionRuns.map((/** @type {any} */ r) => ({ ...r, source: 'production' }))
	]);

	// Keep the latest result for each workflow in each environment. A historical
	// failure should not leave the SDK in an error state after a newer run passes.
	const currentWorkflowRuns = $derived.by(() => {
		const latestByWorkflow = new Map();
		const newestFirst = [...taggedRuns].sort(
			(a, b) => new Date(b.created_at ?? b.updated_at ?? 0).getTime() - new Date(a.created_at ?? a.updated_at ?? 0).getTime()
		);

		for (const run of newestFirst) {
			const workflow = run.workflow_id ?? run.workflow_url ?? run.name ?? 'unknown';
			const key = `${run.source}:${workflow}`;
			if (!latestByWorkflow.has(key)) latestByWorkflow.set(key, run);
		}

		return [...latestByWorkflow.values()];
	});
	const failingRuns = $derived(currentWorkflowRuns.filter((r) => r.conclusion === 'failure'));
	const isRunning = $derived(
		currentWorkflowRuns.some((r) => (r.conclusion ?? r.status) === 'in_progress')
	);
</script>

<div
	class="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
>
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2.5">
			<span class="relative flex h-2.5 w-2.5">
				{#if isRunning}
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"
					></span>
				{/if}
				<span
					class="relative inline-flex h-2.5 w-2.5 rounded-full"
					style="background-color: {isRunning ? '#eab308' : color}; box-shadow: 0 0 0 4px {isRunning
						? '#eab30822'
						: color + '22'}"
				></span>
			</span>
			<h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
		</div>
		<a
			href={`https://github.com/${production}`}
			target="_blank"
			rel="noreferrer"
			class="text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
			title="View {name} SDK repository"
		>
			<Icon name="external-link" class="h-3.5 w-3.5" />
		</a>
	</div>

	{#if error}
		<p
			class="mb-3 flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400"
		>
			<Icon name="alert-triangle" class="h-3.5 w-3.5 shrink-0" />
			{error}
		</p>
	{/if}

	<div class="space-y-2.5">
		<WorkflowBadge label="Staging" run={stagingCiRuns[0]} />
		<WorkflowBadge label="Production" run={productionCiRuns[0]} />

		<div class="flex items-center justify-between text-sm">
			<span class="text-zinc-500 dark:text-zinc-400">Latest version</span>
			{#if latestVersion}
				<a
					href={registry}
					target="_blank"
					rel="noreferrer"
					class="font-mono text-zinc-800 hover:underline dark:text-zinc-200"
				>
					v{latestVersion}
				</a>
			{:else}
				<span class="font-mono text-zinc-400 dark:text-zinc-600">Never released</span>
			{/if}
		</div>

		<div class="flex items-center justify-between">
			<span class="text-sm text-zinc-500 dark:text-zinc-400">Last generated</span>
			<span class="text-sm text-zinc-800 dark:text-zinc-200">
				{relativeTime(stagingHeadCommit?.commit?.author?.date, now.value)}
			</span>
		</div>

		<div class="flex items-center justify-between">
			<span class="text-sm text-zinc-500 dark:text-zinc-400">Staging vs prod</span>
			<DiffBadge aheadBy={diff.ahead_by} behindBy={diff.behind_by} compareUrl={diff.html_url} />
		</div>

		{#if diff.ahead_by > 0}
			<a
				href={`https://github.com/${staging}/actions/workflows/stlc-promote.yml`}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1 rounded-full bg-oba-50 px-2 py-0.5 text-xs font-medium text-oba-700 hover:bg-oba-100 dark:bg-oba-500/10 dark:text-oba-400 dark:hover:bg-oba-500/20"
			>
				<Icon name="rocket" class="h-3 w-3" />
				Promote ready
			</a>
		{/if}

		{#if failingRuns.length > 0}
			<a
				href={failingRuns[0].html_url}
				target="_blank"
				rel="noreferrer"
				class="flex items-center gap-1.5 truncate rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:underline dark:bg-red-500/10 dark:text-red-400"
			>
				<Icon name="alert-triangle" class="h-3.5 w-3.5 shrink-0" />
				<span class="truncate">
					{failingRuns.length} failing workflow{failingRuns.length === 1 ? '' : 's'} · {failingRuns[0].source}:
					{failingRuns[0].name}
				</span>
			</a>
		{/if}

		<div class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
			<a
				href={`https://github.com/${staging}`}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-oba-700 hover:underline dark:text-zinc-400 dark:hover:text-oba-400"
			>
				<Icon name="git-branch" class="h-3 w-3" />
				Staging
			</a>
			<a
				href={`https://github.com/${production}`}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-oba-700 hover:underline dark:text-zinc-400 dark:hover:text-oba-400"
			>
				<Icon name="git-branch" class="h-3 w-3" />
				Production
			</a>
			<a
				href={registry}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-oba-700 hover:underline dark:text-zinc-400 dark:hover:text-oba-400"
			>
				<Icon name="external-link" class="h-3 w-3" />
				Package
			</a>
		</div>

		<RecentRuns runs={taggedRuns} />
	</div>
</div>
