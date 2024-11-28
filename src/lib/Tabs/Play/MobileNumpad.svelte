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
	<div class="number-row">
		<button on:click={() => handleInput('7')}>7</button>
		<button on:click={() => handleInput('8')}>8</button>
		<button on:click={() => handleInput('9')}>9</button>
	</div>
	<div class="number-row">
		<button on:click={() => handleInput('4')}>4</button>
		<button on:click={() => handleInput('5')}>5</button>
		<button on:click={() => handleInput('6')}>6</button>
	</div>
	<div class="number-row">
		<button on:click={() => handleInput('1')}>1</button>
		<button on:click={() => handleInput('2')}>2</button>
		<button on:click={() => handleInput('3')}>3</button>
	</div>
	<div class="number-row">
		<button on:click={() => handleInput('-')}>-</button>
		<button on:click={() => handleInput('0')}>0</button>
		<button on:click={() => handleInput('enter')}>answer</button>
	</div>
</div>

<style>
	.numpad {
		position: absolute;
		bottom: 12dvh;

		height: 20dvh;
		display: grid;
		grid-template-rows: repeat(4, 1fr);

		gap: 5px;
		width: 100dvw;
		margin: auto;
		padding: 10px;

		border-top: #e0e0e0 2px solid;
	}

	.number-row {
		display: flex;
		width: 100%;
		gap: 5px;
	}

	.number-row button {
		flex: 1;
		padding: calc(15px +1vh);
		font-size: 1.2em;
		border: none;
		border: 1px white solid;
		background-color: transparent;
		color: azure;
		border-radius: 5px;
		cursor: pointer;
	}

	.number-row button:active {
		background-color: #e0e0e0;
	}

	/* Last row special handling */
	.number-row:last-child button:nth-child(2) {
		flex: 2;
	}
</style>
