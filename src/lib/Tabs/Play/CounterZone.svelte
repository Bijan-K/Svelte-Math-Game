<!-- src/lib/tabs/play/CounterZone.svelte -->
<script>
	import { cache, functionTriggerInput } from '$lib/stores.js';
	import { fade, slide } from 'svelte/transition';
	import Parallelogram from './Parallelogram.svelte';

	let toggleShow = false;

	$: isTrue = $cache.diff === 'high';

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			toggleShow = false;
		} else {
			toggleShow = true;
		}
	}

	$: if ($functionTriggerInput) {
		toggleShow = false;
	} else {
		toggleShow = true;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="counter-container">
	<div class="container">
		<div class:user-input={toggleShow} class="counter">
			{#if !$cache.gameState}
				<!-- game diff -->
				<h2 class:high={isTrue}>{$cache.diff.toUpperCase()}</h2>
			{:else}
				<!-- input and score -->
				{#if toggleShow}
					<h2>{$cache.userInput}</h2>
				{:else}
					<h2 class:high={isTrue}>Score : {$cache.score}</h2>
				{/if}
			{/if}
		</div>

		<div class="heath-bars">
			{#each Array($cache.hp) as _, i}
				<div in:fade={{ duration: 200 }} out:slide={{ duration: 200 }}>
					<Parallelogram />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.heath-bars {
		position: absolute;
		right: 10px;
		bottom: 10px;
		padding: 2rem 0.5rem;

		display: flex;
		gap: 5px;
	}
	h2 {
		min-height: 2rem;
	}

	.counter-container {
		width: 80vw;
		height: 12dvh;
		min-height: 12dvh;
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 3;
	}

	.container {
		border-top: 1px #eee solid;
		width: 90%;
		padding: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;

		position: relative;
	}
	.counter {
		border-bottom: solid #eee 2px;
		border-left: solid #eee 2px;
		border-right: solid #eee 2px;
		border-radius: 0.25rem;
		padding: 0.5rem 2rem;
	}
	.user-input {
		border-bottom: solid #eee 2px;
		border-left: none;
		border-right: none;
	}

	.high {
		animation: flash 0.5s linear infinite alternate;
	}

	@media (max-width: 768px) {
		.counter-container {
			width: 100vw;
		}
		.container {
			border-top: none;
		}
		h2 {
			font-size: 1.1rem;
		}
		.counter {
			padding: 0.5rem 1.5rem;
		}
	}

	@keyframes flash {
		0% {
			color: #eee;
		}
		100% {
			color: #ff0000;
		}
	}
</style>
