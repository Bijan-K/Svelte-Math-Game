<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
</script>

{#if $modeState == 'play' || $modeState == 'about' || $modeState == 'stats'}
	<aside in:fade={{ duration: 2000, delay: 2000 }}>
		<div>Page:</div>

		<button>Play</button>
		<button>Stats</button>
		<button>About</button>

		{#if $modeState == 'play'}
			<div>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus quisquam dolorum cumque
				sequi animi voluptas ea accusamus consequatur, explicabo inventore suscipit sit ad dolores
				doloremque eveniet distinctio rem. Voluptatum, omnis.
			</div>
		{:else if $modeState == 'stats'}
			<div>No loerm</div>
		{:else if $modeState == 'about'}
			<div>ahahahahahah</div>
		{/if}
	</aside>
{/if}

<style>
	aside {
		height: 100vh;
		border-right: 1px solid #eee;
		width: 20vw;
		position: relative;
		left: 0;
		top: 0;
		background-color: #000;
	}
</style>
