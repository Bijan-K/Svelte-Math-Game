<!-- src/routes/+layout.svelte -->
<script>
	import './globals.css';
	import './scrollbar.css';
	import './mobile-classes.css';

	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { modeState, showOverlay, record, missed_eq_list, menuListIsClosed } from '$lib/stores.js';
	import TagCloud from '../lib/TagCloud.svelte';
	import TypewriterOverlay from '../lib/TypewriterOverlay.svelte';

	function playHandler(e) {
		e.preventDefault();
		showOverlay.set(false);
		modeState.update((n) => e.target.id);
	}

	onMount(() => {
		const recordFromStorage = localStorage.getItem('record');
		const missedEquationsFromStorage = localStorage.getItem('missed_eq_list');

		// Load from localStorage first
		if (recordFromStorage) {
			try {
				record.set(JSON.parse(recordFromStorage));
			} catch (error) {
				console.error('Error parsing stored words:', error);
			}
		}

		if (missedEquationsFromStorage) {
			try {
				missed_eq_list.set(JSON.parse(missedEquationsFromStorage));
			} catch (error) {
				console.error('Error parsing stored other:', error);
			}
		}

		// Then set up subscriptions to save to localStorage
		record.subscribe((value) => {
			localStorage.setItem('record', JSON.stringify(value));
		});

		missed_eq_list.subscribe((value) => {
			localStorage.setItem('missed_eq_list', JSON.stringify(value));
		});
	});
</script>

<div class="app">
	<main>
		<TagCloud />

		{#if $showOverlay}
			<TypewriterOverlay />
		{/if}

		<slot />

		<!-- initial overlay -->
		{#if $showOverlay}
			<div class="block-container">
				<div out:fly={{ x: -500, duration: 2000 }} class="block3"></div>
				<div out:fly={{ x: 500, duration: 2000 }} class="block4"></div>
				<div out:fly={{ y: -500, duration: 2000 }} class="block1"></div>
				<div out:fly={{ y: 500, duration: 2000 }} class="block2"></div>
			</div>

			<div out:fade class="overlay-container">
				<h1>Quick Math Game</h1>
				<p>A simple webapp for practicing mental quick math</p>

				<div class="overlay-btn-container">
					<button id="play" on:click={playHandler} class="playbtn">Play</button>
					<!-- data-sveltekit-reload -->
					<button id="stats" on:click={playHandler} class="playbtn" href="/">Stats</button>
					<button id="about" on:click={playHandler} class="playbtn" href="/">About</button>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
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

	.overlay-container {
		position: fixed;
		top: 0;
		height: 100dvh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		justify-content: center;
		align-items: center;
		z-index: 55;
	}
	.overlay-container h1 {
		font-size: 4rem;
		text-align: center;
	}

	.overlay-container p {
		font-size: 1.5rem;
		text-align: center;
		margin-left: 5%;
		margin-right: 5%;
	}
	.block-container {
		position: fixed;
		height: 100dvh;
		width: 100vw;
		z-index: 20;
	}
	.block1 {
		position: fixed;
		height: 100dvh;
		width: 100vw;
		background-color: #0a0a0a;
		top: -50%;
	}
	.block2 {
		position: fixed;
		height: 100dvh;
		width: 100vw;
		background-color: #0a0a0a;
		top: 50%;
	}

	.block3 {
		position: fixed;
		top: 0;
		height: 100dvh;
		width: 100vw;
		background-color: #0a0a0a;
		right: 50%;
	}
	.block3::before {
		--line: hsla(0, 0%, 95%, 0.25);
		content: '';
		height: 100dvh;
		width: 100vw;
		position: fixed;
		background:
			linear-gradient(90deg, var(--line) 2px, transparent 1px 10vmin) 0 -5vmin / 10vmin 10vmin,
			linear-gradient(var(--line) 2px, transparent 2px 10vmin) 0 -5vmin / 10vmin 10vmin;
		mask: linear-gradient(-15deg, transparent 10%, white);
		top: 0;
		z-index: -1;
	}

	.block4 {
		top: 0;
		position: fixed;
		height: 100dvh;
		width: 100vw;
		background-color: #0a0a0a;
		left: +50%;
	}
	.block4::before {
		--line: hsla(0, 0%, 95%, 0.25);
		content: '';
		height: 100dvh;
		width: 100vw;
		position: fixed;
		background:
			linear-gradient(90deg, var(--line) 2px, transparent 1px 10vmin) 0 -5vmin / 10vmin 10vmin,
			linear-gradient(var(--line) 2px, transparent 2px 10vmin) 0 -5vmin / 10vmin 10vmin;
		mask: linear-gradient(-15deg, transparent 10%, white);
		top: 0;
		z-index: -1;
	}

	.overlay-btn-container {
		display: flex;
		gap: 0.75rem;
		z-index: 55;
	}
	.playbtn {
		padding: 0.5rem;
		border: none;
		background-color: white;
		color: #0a0a0a;
		border-radius: 0.2rem;
		font-size: larger;
		cursor: pointer;
	}
</style>
