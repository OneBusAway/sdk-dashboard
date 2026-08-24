<script>
	import Icon from './Icon.svelte';

	/**
	 * @typedef {{
	 *   targets: Array<{ name: string, diff: { ahead_by: number, html_url?: string | null } }>
	 * }} Props
	 */
	/** @type {Props} */
	let { targets } = $props();
</script>

{#if targets.length > 0}
	<div
		class="mb-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-oba-200 bg-oba-50/60 px-4 py-3 dark:border-oba-500/20 dark:bg-oba-500/5"
	>
		<Icon name="rocket" class="h-4 w-4 shrink-0 text-oba-600 dark:text-oba-400" />
		<h2 class="text-sm font-semibold text-oba-900 dark:text-oba-300">
			{targets.length} pending promotion{targets.length === 1 ? '' : 's'}
		</h2>
		<div class="flex flex-wrap gap-1.5">
			{#each targets as target (target.name)}
				{@const label = `${target.name} — ${target.diff.ahead_by} commit${target.diff.ahead_by === 1 ? '' : 's'} ahead`}
				{#if target.diff.html_url}
					<a
						href={target.diff.html_url}
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-oba-800 ring-1 ring-inset ring-oba-600/20 hover:underline dark:bg-zinc-900 dark:text-oba-300 dark:ring-oba-400/20"
					>
						{label}
					</a>
				{:else}
					<span
						class="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-oba-800 ring-1 ring-inset ring-oba-600/20 dark:bg-zinc-900 dark:text-oba-300 dark:ring-oba-400/20"
					>
						{label}
					</span>
				{/if}
			{/each}
		</div>
	</div>
{/if}
