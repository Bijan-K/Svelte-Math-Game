<script>
	import Aside from '../lib/Aside/Aside.svelte';
	import { fade, fly } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';
	import Counter from '../lib/Counter.svelte';
</script>

<svelte:head>
	<title>Math Game</title>
</svelte:head>

<div class="container">
	<!-- Play -->
	<!-- <div class="container-main"> -->
	{#if $modeState == 'play'}
		<Aside />
		<Counter />
	{/if}
	<!-- </div> -->
	<!-- Stats -->
	<!-- About -->
</div>

<style>
	.container-main {
	}
	.container {
		height: 100vh;
		width: 100vw;
		display: flex;
	}
</style>
