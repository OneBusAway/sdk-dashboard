<script>
	import { relativeTime } from '$lib/time.js';
	import { now } from '$lib/now.svelte.js';
	import Icon from './Icon.svelte';

	/**
	 * @typedef {{
	 *   events: Array<{ repo: string, workflow: string, state: string, url: string, timestamp: string }>
	 * }} Props
	 */
	/** @type {Props} */
	let { events } = $props();

	/** @type {Record<string, { dot: string, icon: string }>} */
	const STATE_STYLE = {
		success: { dot: 'bg-oba-500', icon: 'check' },
		failure: { dot: 'bg-red-500', icon: 'x' },
		cancelled: { dot: 'bg-zinc-400', icon: 'x' },
		skipped: { dot: 'bg-zinc-300 dark:bg-zinc-600', icon: 'skip-forward' },
		in_progress: { dot: 'bg-yellow-500', icon: 'loader' },
		queued: { dot: 'bg-yellow-400', icon: 'clock' }
	};
</script>

<div class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
	<h2 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
		<Icon name="clock" class="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
		Recent activity
	</h2>

	{#if events.length === 0}
		<p class="py-2 text-sm text-zinc-400 dark:text-zinc-500">No recent activity.</p>
	{:else}
		<ul class="relative">
			{#each events as event, i (event.url + event.timestamp)}
				{@const style = STATE_STYLE[event.state] ?? { dot: 'bg-zinc-300', icon: 'clock' }}
				<li class="relative flex gap-3 pb-3 last:pb-0">
					{#if i < events.length - 1}
						<span class="absolute left-[5px] top-3 h-full w-px bg-zinc-100 dark:bg-zinc-800"></span>
					{/if}
					<span class="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
						{#if event.state === 'in_progress'}
							<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"
							></span>
						{/if}
						<span class="relative inline-flex h-2.5 w-2.5 rounded-full {style.dot}"></span>
					</span>
					<a
						href={event.url}
						target="_blank"
						rel="noreferrer"
						class="group -mt-0.5 min-w-0 flex-1 rounded-md px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
					>
						<div class="flex items-baseline justify-between gap-3">
							<p class="min-w-0 truncate text-zinc-700 group-hover:underline dark:text-zinc-300">
								<span class="font-medium text-zinc-900 dark:text-zinc-100">{event.repo}</span>
								· {event.workflow}
								<span class="text-zinc-400 dark:text-zinc-500">{event.state}</span>
							</p>
							<span class="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{relativeTime(event.timestamp, now.value)}</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
