const path = require('path');

// Load the .env file for local development
// .env.development.local by default
require('dotenv').config({
	path: path.resolve(process.cwd(), '.env.development.local'),
});

console.log('TESTING REGEX')

if (
	process.env.WPGRAPHQL_URL === undefined &&
	process.env.PANTHEON_CMS_ENDPOINT === undefined
) {
	let message;
	if (process.env.NODE_ENV === 'development') {
		message = `No WPGRAPHQL_URL found.\nSee the README.md for information on setting this variable locally.`;
	} else if (process.env.NODE_ENV === 'production') {
		message = `No CMS Endpoint found.\nLink a CMS or set the WPGRAPHQL_URL environment variable in the settings tab in the dashboard\nIf your site does not require a backend to build, remove this check from the next.config.js.`;
	}
	throw new Error(message);
}

let backendUrl, imageDomain;
if (process.env.WPGRAPHQL_URL === undefined) {
	backendUrl = `https://${process.env.PANTHEON_CMS_ENDPOINT}/wp/graphql`;
	imageDomain = process.env.IMAGE_DOMAIN || process.env.PANTHEON_CMS_ENDPOINT;

	// populate WPGRAPHQL_URL as a fallback and for build scripts
	process.env.WPGRAPHQL_URL = `https://${process.env.PANTHEON_CMS_ENDPOINT}/wp/graphql`;
} else {
	backendUrl = process.env.WPGRAPHQL_URL;
	imageDomain =
		process.env.IMAGE_DOMAIN ||
		process.env.WPGRAPHQL_URL.replace(/\/wp\/graphql$/, '').replace(
			/^https?:\/\//,
			'',
		);
}
// remove trailing slash if it exists
imageDomain = imageDomain.replace(/\/$/, '');

const injectedOptions = {};
if (process.env.PANTHEON_UPLOAD_PATH) {
	injectedOptions['basePath'] = process.env.PANTHEON_UPLOAD_PATH;
}

if (process.env.PANTHEON_ENVIRONMENT_URL) {
	let PANTHEON_ENVIRONMENT_PREFIX = undefined
	let IS_LIVE_ENVIRONMENT = undefined
	const envPrefix =
		process.env.PANTHEON_ENVIRONMENT_URL.match(/^([^-]*)/)[0];
	console.log(envPrefix)
	console.log('PREFIX')
	if (envPrefix === 'live') {
		console.log('IS LIVE')
		PANTHEON_ENVIRONMENT_PREFIX = 'live'
		IS_LIVE_ENVIRONMENT = 'live'
	} else {
		console.log('ELSE CASE')
		PANTHEON_ENVIRONMENT_PREFIX = process.env.PANTHEON_ENVIRONMENT_URL.match(/^([^-]*-)[^-]*/);
	}
	console.log('PANTHEON ENVIRONMENT')
	console.log(PANTHEON_ENVIRONMENT_PREFIX)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	...(injectedOptions && injectedOptions),
	reactStrictMode: true,
	env: {
		backendUrl: backendUrl,
		imageUrl: `https://${imageDomain}`,
	},
	images: {
		domains: [imageDomain],
	},
	output: 'standalone',
};

module.exports = nextConfig;