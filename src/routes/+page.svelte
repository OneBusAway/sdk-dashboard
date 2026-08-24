<script>
	import { onMount } from 'svelte';
	import { dashboard } from '$lib/dashboard.svelte.js';
	import { settings } from '$lib/settings.svelte.js';
	import { STLC_GENERATE_REPO } from '$lib/config.js';
	import Header from '$lib/components/Header.svelte';
	import SDKCard from '$lib/components/SDKCard.svelte';
	import SDKCardSkeleton from '$lib/components/SDKCardSkeleton.svelte';
	import ActivityFeed from '$lib/components/ActivityFeed.svelte';
	import PendingPromotions from '$lib/components/PendingPromotions.svelte';
	import SdkConfigCard from '$lib/components/SdkConfigCard.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	onMount(() => {
		dashboard.refresh(data.buildTimeVersions);
	});

	$effect(() => {
		const ms = settings.refreshIntervalMinutes * 60 * 1000;
		const interval = setInterval(() => dashboard.refresh(data.buildTimeVersions), ms);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>OneBusAway SDK Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950">
	<Header
		overallHealthy={dashboard.overallHealthy}
		lastUpdated={dashboard.lastUpdated}
		lastFullGenerate={dashboard.lastFullGenerate}
		loading={dashboard.loading}
		onRefresh={() => dashboard.refresh(data.buildTimeVersions)}
	/>

	<main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
		{#if dashboard.globalError}
			<p
				class="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
			>
				<Icon name="alert-triangle" class="h-4 w-4 shrink-0" />
				{dashboard.globalError}
			</p>
		{/if}

		{#if dashboard.loading && dashboard.targets.length === 0}
			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<SDKCardSkeleton />
				{/each}
			</div>
		{:else}
			<SdkConfigCard repo={STLC_GENERATE_REPO} runs={dashboard.sdkConfigRuns} />

			<PendingPromotions targets={dashboard.pendingPromotions} />

			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each dashboard.targets as target (target.name)}
					<SDKCard {...target} />
				{/each}
			</div>

			<ActivityFeed events={dashboard.activityFeed} />
		{/if}
	</main>
</div>
