<script>
	import { onMount } from 'svelte';

	let userInput = '';
	let isNegative = false;

	function handleInput(value) {
		if (value === 'enter') {
			// Process the input here
			console.log('Entered:', isNegative ? -parseFloat(userInput) : parseFloat(userInput));
			userInput = '';
			isNegative = false;
		} else if (value === '-') {
			isNegative = !isNegative;
		} else {
			userInput += value;
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
	<div class="display">{(isNegative ? '-' : '') + userInput}</div>
	{#each ['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', 'enter'] as button}
		<button on:click={() => handleInput(button)}>{button}</button>
	{/each}
</div>

<style>
	.numpad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;
		max-width: 300px;
		margin: auto;
		padding: 10px;
		background-color: #f0f0f0;
		border-radius: 10px;
	}
	.display {
		grid-column: 1 / -1;
		background-color: white;
		padding: 10px;
		text-align: right;
		font-size: 1.5em;
		margin-bottom: 10px;
		border-radius: 5px;
	}
	button {
		padding: 15px;
		font-size: 1.2em;
		background-color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.1s;
	}
	button:active {
		background-color: #e0e0e0;
	}
	button:last-child {
		grid-column: 2 / -1;
	}
</style>
