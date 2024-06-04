<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
</script>

{#if $modeState == 'play' || $modeState == 'about' || $modeState == 'stats'}
	<aside in:slide={{ axis: 'x', duration: 2000, delay: 2000 }}>
		<div>Page:</div>
		{#if $modeState == 'play'}
			<div></div>
		{:else if $modeState == 'stats'}
			<div></div>
		{:else if $modeState == 'about'}
			<div></div>
		{/if}
	</aside>
{/if}

<style>
	aside {
		height: 100vh;
		border-right: 1px solid #eee;
		width: 30%;
		position: relative;
		left: 0;
		top: 0;
		background-color: #000;
	}
</style>
