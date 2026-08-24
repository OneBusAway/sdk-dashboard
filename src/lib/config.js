/**
 * @typedef {Object} Target
 * @property {string} name
 * @property {string} staging
 * @property {string} production
 * @property {string} registry
 * @property {string} registryKind
 * @property {string} color
 * @property {string} [npmPackage]
 * @property {string} [pypiPackage]
 * @property {string} [rubygemsPackage]
 * @property {string} [mavenGroupId]
 * @property {string} [mavenArtifactId]
 */

export const ORG = 'OneBusAway';

/** GitHub token for reading the private staging repos. Baked into the client
 * bundle at build time (see .github/workflows/deploy.yml) — read-only scope. */
export const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN ?? '';

export const STLC_GENERATE_REPO = `${ORG}/sdk-config`;
export const STLC_GENERATE_WORKFLOW = 'stlc-generate.yml';

/** Every staging/production repo has this workflow — it's the one that
 * represents actual CI health, as opposed to bot workflows like "Sync SDK
 * repos" or "Release Please" that can be the most *recent* run without
 * saying anything about whether the SDK actually builds. */
export const CI_WORKFLOW_FILE = 'ci.yml';

/** @type {Target[]} */
export const TARGETS = [
	{
		name: 'Go',
		staging: `${ORG}/onebusaway-go-staging`,
		production: `${ORG}/go-sdk`,
		registry: 'https://pkg.go.dev/github.com/OneBusAway/go-sdk',
		registryKind: 'go',
		color: '#00ADD8'
	},
	{
		name: 'Java',
		staging: `${ORG}/onebusaway-java-staging`,
		production: `${ORG}/java-sdk`,
		registry: 'https://central.sonatype.com/artifact/org.onebusaway/onebusaway-sdk-java',
		registryKind: 'maven',
		mavenGroupId: 'org.onebusaway',
		mavenArtifactId: 'onebusaway-sdk-java',
		color: '#E76F00'
	},
	{
		name: 'Kotlin',
		staging: `${ORG}/onebusaway-kotlin-staging`,
		production: `${ORG}/kotlin-sdk`,
		registry: 'https://central.sonatype.com/artifact/org.onebusaway/onebusaway-sdk-kotlin',
		registryKind: 'maven',
		mavenGroupId: 'org.onebusaway',
		mavenArtifactId: 'onebusaway-sdk-kotlin',
		color: '#7F52FF'
	},
	{
		name: 'Node',
		staging: `${ORG}/onebusaway-node-staging`,
		production: `${ORG}/js-sdk`,
		registry: 'https://npmjs.com/package/onebusaway-sdk',
		registryKind: 'npm',
		npmPackage: 'onebusaway-sdk',
		color: '#339933'
	},
	{
		name: 'Python',
		staging: `${ORG}/onebusaway-python-staging`,
		production: `${ORG}/python-sdk`,
		registry: 'https://pypi.org/project/onebusaway',
		registryKind: 'pypi',
		pypiPackage: 'onebusaway',
		color: '#3776AB'
	},
	{
		name: 'Ruby',
		staging: `${ORG}/onebusaway-ruby-staging`,
		production: `${ORG}/ruby-sdk`,
		registry: 'https://rubygems.org/gems/onebusaway-sdk',
		registryKind: 'rubygems',
		rubygemsPackage: 'onebusaway-sdk',
		color: '#CC0000'
	}
];
