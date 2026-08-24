<script>
	/**
	 * @typedef {{ aheadBy: number, behindBy: number, compareUrl?: string | null }} Props
	 */
	/** @type {Props} */
	let { aheadBy, behindBy, compareUrl = null } = $props();

	const inSync = $derived(aheadBy === 0 && behindBy === 0);
	const label = $derived(
		inSync
			? 'In sync'
			: aheadBy > 0
				? `${aheadBy} commit${aheadBy === 1 ? '' : 's'} ahead`
				: `${behindBy} commit${behindBy === 1 ? '' : 's'} behind`
	);
	const colorClass = $derived(
		inSync
			? 'text-zinc-500 dark:text-zinc-400'
			: aheadBy > 0
				? 'text-oba-700 font-medium dark:text-oba-400'
				: 'text-red-700 font-medium dark:text-red-400'
	);
</script>

{#if compareUrl}
	<a href={compareUrl} target="_blank" rel="noreferrer" class="text-sm hover:underline {colorClass}">
		{label}
	</a>
{:else}
	<span class="text-sm {colorClass}">{label}</span>
{/if}
