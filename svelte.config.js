import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({
		scss: {
			prependData: '@use "sass:math";',
			quietDeps: true, // Suppresses warnings from dependencies
			silenceDeprecations: ['legacy-js-api', 'color-functions'], // Suppress specific deprecation warnings
			api: 'modern-compiler', // Use modern Sass API
			logger: {
				warn: function (message) {
					// Suppress specific Bootstrap-related warnings
					if (
						message.includes('Unused CSS selector') ||
						message.includes('red() is deprecated') ||
						message.includes('green() is deprecated') ||
						message.includes('blue() is deprecated') ||
						message.includes('The legacy JS API is deprecated')
					) {
						return;
					}
					console.warn(message);
				}
			}
		}
	}),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib'
		},
		// Adjust prerender settings as needed for SSR
		prerender: {
			entries: ['*'] // Adjust or remove if full SSR is desired
			// If you prefer full SSR without prerendering, you can disable it:
			// default: false
		}
	}
};

export default config;
