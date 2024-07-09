<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Configurable variables
	const containerWidth = 800; // Width of the parent container
	const containerHeight = 600; // Height of the parent container
	const elementWidth = 50; // Width of the elements
	const elementHeight = 50; // Height of the elements
	const elementLifetime = 5000; // Lifetime of each element in ms (5 seconds)

	let elements = [];
	let idCounter = 0;

	function createRandomElement() {
		const id = ++idCounter; // Use a counter for unique IDs
		const x = Math.random() * (containerWidth - elementWidth);
		const y = Math.random() * (containerHeight - elementHeight);
		elements = [...elements, { id, x, y, progress: 100 }];
	}

	function startElementTimer(element) {
		const interval = setInterval(() => {
			element.progress -= 2; // Decrease progress by 2% every 100ms
			if (element.progress <= 0) {
				clearInterval(interval);
				removeElement(element.id);
				onTimerEnd(element.id);
			}
		}, 100);
	}

	function removeElement(id) {
		elements = elements.filter((el) => el.id !== id);
	}

	function onTimerEnd(id) {
		console.log(`Timer ended for element ${id}`);
	}

	function onElementClick(id) {
		removeElement(id);
		console.log(`Element ${id} clicked`);
	}

	onMount(() => {
		// Create a bunch of elements initially
		for (let i = 0; i < 10; i++) {
			createRandomElement();
		}

		// Start the timers for each element
		elements.forEach((element) => startElementTimer(element));
	});
</script>

<div class="container">
	{#each elements as element (element.id)}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="element"
			style="left: {element.x}px; top: {element.y}px;"
			on:click={() => onElementClick(element.id)}
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		>
			{element.id}
			<div class="progress-bar">
				<div class="progress" style="width: {element.progress}%;"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.container {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px solid #ccc;
		background-color: black;
		z-index: 3;
	}
	.element {
		position: absolute;
		width: 100px;
		height: 50px;
		background-color: lightblue;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		border-radius: 4px;
		cursor: pointer;
	}
	.progress-bar {
		width: 100%;
		height: 5px;
		background-color: #f0f0f0;
		border-radius: 2px;
		overflow: hidden;
		margin-top: 5px;
	}
	.progress {
		height: 100%;
		background-color: green;
		transition: width 0.1s linear;
	}
</style>
