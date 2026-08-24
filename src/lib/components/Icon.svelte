<script>
	/** @typedef {{ name: string, class?: string }} Props */
	/** @type {Props} */
	let { name, class: className = 'h-4 w-4' } = $props();

	/** @type {Record<string, string | string[]>} */
	const PATHS = {
		check: 'M20 6 9 17l-5-5',
		x: 'M18 6 6 18M6 6l12 12',
		clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
		'skip-forward': 'M5 4v16l11-8L5 4Zm13 0v16',
		'arrow-up-right': 'M7 17 17 7M7 7h10v10',
		'external-link': 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
		rocket:
			'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09ZM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2ZM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
		'refresh-cw':
			'M21 12a9 9 0 0 1-15.5 6.36M3 12a9 9 0 0 1 15.5-6.36M21 3v6h-6M3 21v-6h6',
		'alert-triangle':
			'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01',
		'git-branch': 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9',
		sun: [
			'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
			'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'
		],
		moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
		loader: 'M12 2a10 10 0 0 1 10 10'
	};

	const paths = $derived(Array.isArray(PATHS[name]) ? PATHS[name] : [PATHS[name] ?? '']);
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each paths as d (d)}
		<path {d} />
	{/each}
</svg>
