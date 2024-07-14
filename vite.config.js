import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	resolve: {
		alias: {
			tagcloud: 'node_modules/TagCloud/dist/TagCloud.js'
		}
	}
});
