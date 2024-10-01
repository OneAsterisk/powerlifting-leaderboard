import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({
		scss: {
			prependData: '@use "sass:math";',
			quietDeps: true // Suppresses warnings from dependencies
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
