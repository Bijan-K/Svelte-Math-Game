<script>
	import Aside from '$lib/Aside/Aside.svelte';
	import { fade, fly } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
	import PlayModeContainer from '$lib/PlayMode/PlayModeContainer.svelte';
	import StatsContainer from '$lib/StatsComponents/StatsContainer.svelte';
	import AboutContainer from '$lib/AboutComponents/AboutContainer.svelte';
</script>

<svelte:head>
	<title>Math Game</title>
</svelte:head>

<Aside />
<!-- Play -->
{#if $modeState == 'play'}
	<PlayModeContainer />
{:else if $modeState == 'stats'}
	<StatsContainer />
{:else if $modeState == 'about'}
	<AboutContainer />
{/if}

<!-- About -->

<style>
</style>
