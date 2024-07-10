import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter()
	},

	onwarn: (warning, handler) => {
		// Disable a11y warnings for on:click on divs and spans
		if (
			warning.code === 'a11y-click-events-have-key-events' ||
			warning.code === 'a11y-no-static-element-interactions'
		) {
			return;
		}
		// Handle all other warnings normally
		handler(warning);
	}
};

export default config;
