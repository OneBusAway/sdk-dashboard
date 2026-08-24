import { GITHUB_TOKEN, CI_WORKFLOW_FILE } from './config.js';

const API_ROOT = 'https://api.github.com';

/**
 * @param {string} path
 * @returns {Promise<any>}
 */
async function ghFetch(path) {
	/** @type {Record<string, string>} */
	const headers = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28'
	};
	if (GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
	}

	const res = await fetch(`${API_ROOT}${path}`, { headers });

	if (res.status === 404) {
		return null;
	}
	if (res.status === 403 || res.status === 429) {
		const resetHeader = res.headers.get('x-ratelimit-reset');
		const resetAt = resetHeader ? new Date(Number(resetHeader) * 1000) : null;
		throw new Error(
			`GitHub API rate limit hit for ${path}${resetAt ? ` (resets ${resetAt.toLocaleTimeString()})` : ''}`
		);
	}
	if (!res.ok) {
		throw new Error(`GitHub API error ${res.status} for ${path}`);
	}
	return res.json();
}

/**
 * Latest workflow runs for a repo, newest first.
 * @param {string} repo - "owner/name"
 * @param {number} perPage
 */
export async function getWorkflowRuns(repo, perPage = 5) {
	const data = await ghFetch(`/repos/${repo}/actions/runs?per_page=${perPage}`);
	return data?.workflow_runs ?? [];
}

/**
 * Runs for one specific workflow file, newest first.
 * @param {string} repo
 * @param {string} workflowFile - e.g. "stlc-generate.yml"
 * @param {number} perPage
 */
export async function getWorkflowRunsFor(repo, workflowFile, perPage = 5) {
	const data = await ghFetch(
		`/repos/${repo}/actions/workflows/${workflowFile}/runs?per_page=${perPage}`
	);
	return data?.workflow_runs ?? [];
}

/**
 * @param {string} repo
 * @param {string} base
 * @param {string} head
 */
export async function compareCommits(repo, base, head) {
	if (!base || !head || base === head) {
		return { ahead_by: 0, behind_by: 0, html_url: null, commits: [] };
	}
	const data = await ghFetch(
		`/repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`
	);
	return data ?? { ahead_by: 0, behind_by: 0, html_url: null, commits: [] };
}

/**
 * @param {string} repo
 * @param {string} ref
 */
export async function getCommit(repo, ref = 'main') {
	return ghFetch(`/repos/${repo}/commits/${ref}`);
}

/**
 * @param {string} repo
 */
export async function getLatestRelease(repo) {
	return ghFetch(`/repos/${repo}/releases/latest`);
}

/**
 * Fetches everything the dashboard needs for a single SDK target, in parallel.
 * @param {import('./config.js').Target} target
 */
export async function fetchTargetData(target) {
	const [stagingRuns, productionRuns, stagingCiRuns, productionCiRuns, stagingHead, productionHead, productionRelease] =
		await Promise.all([
			getWorkflowRuns(target.staging, 10),
			getWorkflowRuns(target.production, 10),
			// Fetched separately (not filtered out of the list above) because
			// bot workflows like "Sync SDK repos" run far more often than CI
			// and can push the actual CI runs out of even a 10-run window.
			getWorkflowRunsFor(target.staging, CI_WORKFLOW_FILE, 3),
			getWorkflowRunsFor(target.production, CI_WORKFLOW_FILE, 3),
			getCommit(target.staging, 'main'),
			getCommit(target.production, 'main'),
			getLatestRelease(target.production)
		]);

	let diff = { ahead_by: 0, behind_by: 0, html_url: null };
	try {
		// Staging and production share commit history (production is generated
		// from staging), so the comparison is run in the staging repo's context.
		diff =
			productionHead?.sha && stagingHead?.sha
				? await compareCommits(target.staging, productionHead.sha, stagingHead.sha)
				: { ahead_by: 0, behind_by: 0, html_url: null };
	} catch {
		// Comparison can fail if the two refs don't share history in the
		// staging repo (e.g. production/staging diverged or were rewritten).
		diff = { ahead_by: 0, behind_by: 0, html_url: null };
	}

	return {
		...target,
		stagingRuns,
		productionRuns,
		stagingCiRuns,
		productionCiRuns,
		stagingHeadCommit: stagingHead,
		productionRelease,
		diff,
		fetchedAt: new Date().toISOString(),
		error: null
	};
}

/**
 * Fetches all targets in parallel; a single target's failure doesn't block the rest.
 * @param {import('./config.js').Target[]} targets
 */
export async function fetchAllTargets(targets) {
	return Promise.all(
		targets.map(async (target) => {
			try {
				return await fetchTargetData(target);
			} catch (err) {
				return {
					...target,
					stagingRuns: [],
					productionRuns: [],
					stagingCiRuns: [],
					productionCiRuns: [],
					stagingHeadCommit: null,
					productionRelease: null,
					diff: { ahead_by: 0, behind_by: 0, html_url: null },
					fetchedAt: new Date().toISOString(),
					error: err instanceof Error ? err.message : String(err)
				};
			}
		})
	);
}

/**
 * Status of the org-wide "generate all SDKs" workflow.
 * @param {string} repo
 * @param {string} workflowFile
 */
export async function getLastFullGenerate(repo, workflowFile) {
	const runs = await getWorkflowRunsFor(repo, workflowFile, 5);
	return runs.find((/** @type {any} */ r) => r.conclusion === 'success') ?? runs[0] ?? null;
}
