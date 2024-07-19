<script>
	import Aside from '$lib/Aside/Aside.svelte';
	import PlayModeContainer from '$lib/PlayMode/PlayModeContainer.svelte';
	import StatsContainer from '$lib/StatsComponents/StatsContainer.svelte';
	import AboutContainer from '$lib/AboutComponents/AboutContainer.svelte';

	import { modeState, isMobile } from '$lib/stores.js';
	import { onMount } from 'svelte';

	let windowWidth;

	$: if (windowWidth < 768) isMobile.update((n) => true);
	$: if (windowWidth > 768) isMobile.update((n) => false);

	onMount(() => {
		windowWidth = window.innerWidth;
	});
</script>

<svelte:head>
	<title>Math Game</title>
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

<Aside />
<!-- Play -->
<div class="prime-container">
	{#if $modeState == 'play'}
		<PlayModeContainer />
	{:else if $modeState == 'stats'}
		<StatsContainer />
	{:else if $modeState == 'about'}
		<AboutContainer />
	{/if}
</div>

<style>
	.prime-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 80vw;
		height: 100dvh;
		z-index: 20;
		background-color: #000;
		transition: all 0.5s;
	}

	@media (max-width: 768px) {
		.prime-container {
			width: 100vw;
		}
	}
</style>
