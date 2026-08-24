import { TARGETS } from '$lib/config.js';
import { getLatestVersion } from '$lib/registries.js';

export const prerender = true;

/**
 * rubygems.org and search.maven.org don't send CORS headers, so those
 * lookups can never succeed from browser JS — they're resolved here at
 * build time instead (refreshed on every rebuild, see deploy.yml's
 * 10-minute schedule). npm/PyPI/GitHub all support CORS and are fetched
 * live client-side in dashboard.svelte.js instead, for freshness.
 */
export async function load() {
	const buildTimeTargets = TARGETS.filter(
		(t) => t.registryKind === 'maven' || t.registryKind === 'rubygems'
	);
	const entries = await Promise.all(
		buildTimeTargets.map(async (t) => /** @type {[string, string | null]} */ ([t.name, await getLatestVersion(t)]))
	);
	return { buildTimeVersions: Object.fromEntries(entries) };
}
