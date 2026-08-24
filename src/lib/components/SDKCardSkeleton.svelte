<div class="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
	<div class="mb-4 flex items-center gap-2.5">
		<span class="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
		<span class="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700"></span>
	</div>
	<div class="space-y-3">
		{#each Array(5) as _}
			<div class="flex items-center justify-between">
				<span class="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800"></span>
				<span class="h-3 w-14 rounded bg-zinc-100 dark:bg-zinc-800"></span>
			</div>
		{/each}
	</div>
</div>
