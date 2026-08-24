<script>
	import { theme } from '$lib/theme.svelte.js';
	import Icon from './Icon.svelte';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	class="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
	title={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
	aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
>
	<Icon name={theme.dark ? 'sun' : 'moon'} class="h-4 w-4" />
</button>
