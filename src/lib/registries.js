/**
 * Fetches the latest published version for a target from its package
 * registry. Returns null if the package has never been published or the
 * lookup fails — callers should render "Never released" in that case.
 * @param {import('./config.js').Target} target
 * @returns {Promise<string | null>}
 */
export async function getLatestVersion(target) {
	try {
		switch (target.registryKind) {
			case 'npm':
				return target.npmPackage ? await getNpmVersion(target.npmPackage) : null;
			case 'pypi':
				return target.pypiPackage ? await getPypiVersion(target.pypiPackage) : null;
			case 'rubygems':
				return target.rubygemsPackage ? await getRubygemsVersion(target.rubygemsPackage) : null;
			case 'maven':
				return target.mavenGroupId && target.mavenArtifactId
					? await getMavenVersion(target.mavenGroupId, target.mavenArtifactId)
					: null;
			case 'go':
				// pkg.go.dev has no public JSON API; fall back to the production
				// repo's latest GitHub release, fetched separately by the caller.
				return null;
			default:
				return null;
		}
	} catch {
		return null;
	}
}

/** @param {string} pkg */
async function getNpmVersion(pkg) {
	const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.version ?? null;
}

/** @param {string} pkg */
async function getPypiVersion(pkg) {
	const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.info?.version ?? null;
}

/** @param {string} pkg */
async function getRubygemsVersion(pkg) {
	const res = await fetch(`https://rubygems.org/api/v1/versions/${encodeURIComponent(pkg)}/latest.json`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.version && data.version !== 'unknown' ? data.version : null;
}

/**
 * Reads the repository's own metadata file directly rather than
 * search.maven.org's search index, which lags behind fresh publishes by a
 * noticeable amount (observed several hours behind for a same-day alpha).
 * @param {string} groupId @param {string} artifactId
 */
async function getMavenVersion(groupId, artifactId) {
	const path = groupId.replace(/\./g, '/');
	const res = await fetch(
		`https://repo1.maven.org/maven2/${path}/${encodeURIComponent(artifactId)}/maven-metadata.xml`
	);
	if (!res.ok) return null;
	const xml = await res.text();
	return xml.match(/<release>([^<]+)<\/release>/)?.[1] ?? xml.match(/<latest>([^<]+)<\/latest>/)?.[1] ?? null;
}
