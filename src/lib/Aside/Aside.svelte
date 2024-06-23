<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
	import PlayAside from './PlayAside.svelte';
	import StatsAside from './StatsAside.svelte';
	import AboutAside from '$lib/Aside/AboutAside.svelte';

	$: console.log($modeState);
</script>

{#if $modeState == 'play' || $modeState == 'about' || $modeState == 'stats'}
	<aside in:fade={{ duration: 2000 }}>
		<div in:fade={{ duration: 500, delay: 4000 }}>
			{#if $modeState == 'play'}
				<PlayAside />
			{:else if $modeState == 'stats'}
				<StatsAside />
			{:else if $modeState == 'about'}
				<AboutAside />
			{/if}

			<div class="setting">
				<div>Page:</div>

				<button>Play</button>
				<button>Stats</button>
				<button>About</button>
			</div>
		</div>
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

		z-index: 3;
	}
	.setting {
	}
</style>
