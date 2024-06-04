<script>
	import Aside from '../lib/Aside/Aside.svelte';
	import './globals.css';
</script>

<div class="app">
	<main>
		<Aside />
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;

		width: 100%;
		height: 100%;

		max-width: 64rem;
		box-sizing: border-box;
	}
</style>
