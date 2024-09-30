import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({
		scss: {
			prependData: '@use "sass:math";',
			quietDeps: true // This line suppresses warnings from dependencies
		}
	}),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		alias: {
			$lib: 'src/lib'
		},
		prerender: {
			crawl: true,
			entries: ['*']
		}
	}
};

export default config;
