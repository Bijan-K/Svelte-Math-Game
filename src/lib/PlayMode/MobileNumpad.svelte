<script>
	import { onMount } from 'svelte';
	import { cache, functionTriggerEnter, functionTriggerInput } from '$lib/stores.js';

	let userInput = '';

	function handleInput(value) {
		if (value === 'enter') {
			// Process the input here
			userInput = '';
			functionTriggerEnter.update((n) => true);
			functionTriggerInput.update((n) => true);
		} else {
			userInput += value;
			functionTriggerInput.update((n) => false);
			cache.update((n) => ({ ...n, userInput: userInput }));
		}
	}

	onMount(() => {
		document.addEventListener('keydown', (e) => {
			if ('0123456789-'.includes(e.key) || e.key === 'Enter') {
				handleInput(e.key === 'Enter' ? 'enter' : e.key);
			}
		});
	});
</script>

<div class="numpad">
	{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'enter'] as button}
		<button on:click={() => handleInput(button)}>{button}</button>
	{/each}
</div>

<style>
	.numpad {
		position: absolute;
		bottom: 12dvh;

		height: 20dvh;
		display: grid;
		grid-template-columns: repeat(4, 1fr);

		gap: 5px;
		width: 100dvw;
		margin: auto;
		padding: 10px;

		border-top: #e0e0e0 2px solid;
	}

	button {
		padding: calc(15px +1vh);
		font-size: 1.2em;
		border: none;
		border: 1px white solid;
		background-color: transparent;
		color: azure;
		border-radius: 5px;
		cursor: pointer;
	}
	button:active {
		background-color: #e0e0e0;
	}

	button:last-child {
		grid-row: 1/3;
		grid-column: 4/4;
	}
</style>
