import { TARGETS, STLC_GENERATE_REPO, STLC_GENERATE_WORKFLOW } from './config.js';
import { fetchAllTargets, getLastFullGenerate, getWorkflowRuns } from './github.js';
import { getLatestVersion } from './registries.js';

/**
 * @typedef {Awaited<ReturnType<typeof fetchAllTargets>>[number] & { latestVersion: string | null }} TargetData
 */

function createDashboardStore() {
	/** @type {TargetData[]} */
	let targets = $state([]);
	/** @type {Awaited<ReturnType<typeof getLastFullGenerate>>} */
	let lastFullGenerate = $state(null);
	/** @type {Awaited<ReturnType<typeof getWorkflowRuns>>} */
	let sdkConfigRuns = $state([]);
	let lastUpdated = $state(/** @type {Date | null} */ (null));
	let loading = $state(true);
	/** @type {string | null} */
	let globalError = $state(null);

	const overallHealthy = $derived(
		targets.length > 0 &&
			targets.every((t) => {
				const latestStaging = t.stagingCiRuns[0];
				const latestProduction = t.productionCiRuns[0];
				/** @param {{ conclusion?: string | null }} [run] */
				const failing = (run) => run && run.conclusion === 'failure';
				return !failing(latestStaging) && !failing(latestProduction);
			}) &&
			lastFullGenerate?.conclusion !== 'failure'
	);

	const pendingPromotions = $derived(targets.filter((t) => t.diff.ahead_by > 0));

	const activityFeed = $derived.by(() => {
		/** @type {Array<{ repo: string, workflow: string, state: string, url: string, timestamp: string }>} */
		const events = [];
		for (const t of targets) {
			for (const run of [...t.stagingRuns.slice(0, 3), ...t.productionRuns.slice(0, 3)]) {
				events.push({
					repo: run.repository?.name ?? t.name,
					workflow: run.name ?? 'Workflow',
					state: run.conclusion ?? run.status ?? 'unknown',
					url: run.html_url,
					timestamp: run.updated_at
				});
			}
		}
		for (const run of sdkConfigRuns.slice(0, 3)) {
			events.push({
				repo: run.repository?.name ?? 'sdk-config',
				workflow: run.name ?? 'Workflow',
				state: run.conclusion ?? run.status ?? 'unknown',
				url: run.html_url,
				timestamp: run.updated_at
			});
		}
		events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		return events.slice(0, 10);
	});

	/**
	 * @param {Record<string, string | null>} buildTimeVersions - maven/rubygems
	 *   versions resolved at build time (see +page.js), keyed by target name.
	 *   Those two registries don't send CORS headers, so they can't be
	 *   fetched client-side at all.
	 */
	async function refresh(buildTimeVersions = {}) {
		loading = targets.length === 0;
		globalError = null;
		try {
			const [targetResults, generateRun, configRuns] = await Promise.all([
				fetchAllTargets(TARGETS),
				getLastFullGenerate(STLC_GENERATE_REPO, STLC_GENERATE_WORKFLOW).catch(() => null),
				getWorkflowRuns(STLC_GENERATE_REPO, 10).catch(() => [])
			]);

			// Resolve package registry versions in parallel, then merge in.
			const versions = await Promise.allSettled(
				targetResults.map((t) => {
					if (t.registryKind === 'go') {
						// Go has no public registry API; fall back to the release tag,
						// stripped of its leading "v" so display formatting stays uniform.
						return Promise.resolve(t.productionRelease?.tag_name?.replace(/^v/, '') ?? null);
					}
					if (t.registryKind === 'maven' || t.registryKind === 'rubygems') {
						return Promise.resolve(buildTimeVersions[t.name] ?? null);
					}
					return getLatestVersion(t);
				})
			);

			targets = targetResults.map((t, i) => {
				const result = versions[i];
				return { ...t, latestVersion: result.status === 'fulfilled' ? result.value : null };
			});
			lastFullGenerate = generateRun;
			sdkConfigRuns = configRuns;
			lastUpdated = new Date();
		} catch (err) {
			globalError = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}

	return {
		get targets() {
			return targets;
		},
		get lastFullGenerate() {
			return lastFullGenerate;
		},
		get sdkConfigRuns() {
			return sdkConfigRuns;
		},
		get lastUpdated() {
			return lastUpdated;
		},
		get loading() {
			return loading;
		},
		get globalError() {
			return globalError;
		},
		get overallHealthy() {
			return overallHealthy;
		},
		get pendingPromotions() {
			return pendingPromotions;
		},
		get activityFeed() {
			return activityFeed;
		},
		refresh
	};
}

export const dashboard = createDashboardStore();
