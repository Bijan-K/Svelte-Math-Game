<script>
	import { fade, fly } from 'svelte/transition';
	import { modeState } from '$lib/stores.js';

	let showOverlay = true;

	function playHandler(e, e2) {
		e.preventDefault();
		showOverlay = !showOverlay;
		modeState.update((n) => e.target.id);
	}
</script>

<svelte:head>
	<title>Math Game</title>
</svelte:head>

<div class="container">
	<!-- Play -->

	<!-- Stats -->
	<!-- About -->

	<!-- initial overlay -->
	{#if showOverlay}
		<div class="block-container">
			<div out:fly={{ x: -500, duration: 4000 }} class="block3"></div>
			<div out:fly={{ x: 500, duration: 4000 }} class="block4"></div>
			<div out:fly={{ y: -500, duration: 4000 }} class="block1"></div>
			<div out:fly={{ y: 500, duration: 4000 }} class="block2"></div>
		</div>

		<div out:fade class="overlay-container">
			<h1>Quick Maths Game</h1>
			<p>A simple webapp for practicing mental quick math</p>

			<div class="overlay-btn-container">
				<button id="play" on:click={playHandler} class="playbtn">Play</button>
				<!-- data-sveltekit-reload -->
				<button id="stats" on:click={playHandler} class="playbtn" href="/">Stats</button>
				<button id="about" on:click={playHandler} class="playbtn" href="/">About</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		height: 100%;

		width: 100vw;
		display: flex;
		flex-grow: 1;
		gap: 2rem;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.overlay-container {
		margin: 0 5%;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		justify-content: center;
		align-items: center;
		z-index: 3;
	}
	.overlay-container h1 {
		font-size: 4rem;
	}
	.block-container {
		position: fixed;
		height: 100vh;
		width: 100vw;
		z-index: 2;
	}
	.block1 {
		position: fixed;
		height: 100vh;
		width: 100vw;
		background-color: #111;
		top: -50%;
	}
	.block2 {
		position: fixed;
		height: 100vh;
		width: 100vw;
		background-color: #111;
		top: 50%;
	}

	.block3 {
		position: fixed;
		top: 0;
		height: 100vh;
		width: 100vw;
		background-color: #111;
		right: 50%;
	}
	.block3::before {
		--line: hsla(0, 0%, 95%, 0.25);
		content: '';
		height: 100vh;
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
		height: 100vh;
		width: 100vw;
		background-color: #111;
		left: +50%;
	}
	.block4::before {
		--line: hsla(0, 0%, 95%, 0.25);
		content: '';
		height: 100vh;
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
	}
	.playbtn {
		padding: 0.5rem;
		border: none;
		background-color: white;
		color: #111;
		border-radius: 0.2rem;
		font-size: larger;
		cursor: pointer;
	}
</style>
