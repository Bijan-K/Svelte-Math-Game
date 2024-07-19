<script>
	import { fade } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
	import PlayAside from './Components/PlayAside.svelte';
	import StatsAside from './Components/StatsAside.svelte';
	import AboutAside from './Components/AboutAside.svelte';
	import MinusIcon from '../Icons/MinusIcon.svelte';
	import AddIcon from '../Icons/AddIcon.svelte';
	import AsideSetting from './AsideSetting.svelte';

	$: $modeState;
</script>

{#if $modeState == 'play' || $modeState == 'about' || $modeState == 'stats'}
	<div class="aside">
		<div in:fade={{ duration: 200, delay: 1500 }}>
			<h2>
				<MinusIcon />

				Quick Math
				<AddIcon />
			</h2>

			{#if $modeState == 'play'}
				<PlayAside />
			{:else if $modeState == 'stats'}
				<StatsAside />
			{:else if $modeState == 'about'}
				<AboutAside />
			{/if}

			<AsideSetting />
		</div>
	</div>
{/if}

<style>
	.aside {
		height: 100dvh;
		border-right: 1px solid #eee;
		width: 20vw;
		position: relative;
		left: 0;
		top: 0;
		background-color: transparent;

		z-index: 3;
	}

	@media (max-width: 768px) {
		.aside {
			width: 90vw;
		}
	}

	h2 {
		text-align: center;
		font-size: 2rem;
		padding: 0.5rem;
	}
</style>
