<script>
	import { onMount, tick, onDestroy } from 'svelte';
	import Typewriter from './Typewriter.svelte';

	let interval;
	let interval2;
	let container;
	let elements = [];

	const equations = [
		{ text: '15 * 14 = 210', weight: 10 },
		{ text: '45 / 5 = 9', weight: 10 },
		{ text: '37 + 26 = 63', weight: 10 },
		{ text: '81 - 27 = 54', weight: 10 },
		{ text: '12 * 16 = 192', weight: 10 },
		{ text: '144 / 12 = 12', weight: 10 },
		{ text: '58 + 42 = 100', weight: 10 },
		{ text: '100 - 47 = 53', weight: 10 },
		{ text: '23 * 7 = 161', weight: 10 },
		{ text: '96 / 8 = 12', weight: 10 },
		{ text: '48 * 5 = 240', weight: 10 },
		{ text: '72 / 6 = 12', weight: 10 },
		{ text: '68 + 37 = 105', weight: 10 },
		{ text: '92 - 38 = 54', weight: 10 },
		{ text: '14 * 13 = 182', weight: 10 },
		{ text: '120 / 10 = 12', weight: 10 },
		{ text: '55 + 45 = 100', weight: 10 },
		{ text: '130 - 50 = 80', weight: 10 },
		{ text: '19 * 11 = 209', weight: 10 },
		{ text: '84 / 7 = 12', weight: 10 },
		{ text: '27 * 15 = 405', weight: 10 },
		{ text: '180 / 15 = 12', weight: 10 },
		{ text: '75 + 25 = 100', weight: 10 },
		{ text: '150 - 60 = 90', weight: 10 },
		{ text: '21 * 18 = 378', weight: 10 },
		{ text: '108 / 9 = 12', weight: 10 },
		{ text: '47 + 53 = 100', weight: 10 },
		{ text: '130 - 45 = 85', weight: 10 },
		{ text: '16 * 14 = 224', weight: 10 },
		{ text: '240 / 20 = 12', weight: 10 },
		{ text: '63 + 37 = 100', weight: 10 },
		{ text: '170 - 85 = 85', weight: 10 },
		{ text: '12 * 15 = 180', weight: 10 },
		{ text: '144 / 12 = 12', weight: 10 },
		{ text: '51 + 49 = 100', weight: 10 },
		{ text: '200 - 100 = 100', weight: 10 },
		{ text: '18 * 12 = 216', weight: 10 },
		{ text: '216 / 18 = 12', weight: 10 },
		{ text: '38 + 62 = 100', weight: 10 },
		{ text: '190 - 75 = 115', weight: 10 },
		{ text: '22 * 9 = 198', weight: 10 },
		{ text: '270 / 15 = 18', weight: 10 },
		{ text: '65 + 35 = 100', weight: 10 },
		{ text: '210 - 95 = 115', weight: 10 },
		{ text: '24 * 8 = 192', weight: 10 },
		{ text: '192 / 8 = 24', weight: 10 },
		{ text: '42 + 58 = 100', weight: 10 },
		{ text: '250 - 110 = 140', weight: 10 },
		{ text: '13 * 20 = 260', weight: 10 },
		{ text: '260 / 13 = 20', weight: 10 }
	];

	function getRandomEquations(equations, count = 9) {
		const shuffled = [...equations].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	}

	function getRandomPosition(containerWidth, containerHeight, elementWidth, elementHeight) {
		const minX = 0;
		const maxX = containerWidth - elementWidth;
		const minY = 0;
		const maxY = containerHeight - elementHeight;

		// Calculate the forbidden zone
		const forbiddenXStart = containerWidth * 0.35;
		const forbiddenXEnd = containerWidth * 0.65;
		const forbiddenYStart = containerHeight * 0.35;
		const forbiddenYEnd = containerHeight * 0.65;

		let randomX, randomY;

		do {
			// Generate random X position
			if (Math.random() < 0.35) {
				randomX = Math.floor(Math.random() * (forbiddenXStart - minX)) + minX;
			} else {
				randomX = Math.floor(Math.random() * (maxX - forbiddenXEnd)) + forbiddenXEnd;
			}

			// Generate random Y position
			if (Math.random() < 0.35) {
				randomY = Math.floor(Math.random() * (forbiddenYStart - minY)) + minY;
			} else {
				randomY = Math.floor(Math.random() * (maxY - forbiddenYEnd)) + forbiddenYEnd;
			}
		} while (
			randomX >= forbiddenXStart &&
			randomX <= forbiddenXEnd &&
			randomY >= forbiddenYStart &&
			randomY <= forbiddenYEnd
		);

		return { top: `${randomY}px`, left: `${randomX}px` };
	}

	async function spawnElements() {
		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;
		const elementWidth = 100;
		const elementHeight = 50;

		elements = getRandomEquations(equations).map((equation) => {
			const position = getRandomPosition(
				containerWidth,
				containerHeight,
				elementWidth,
				elementHeight
			);
			return { ...equation, style: position, key: Math.random() };
		});

		await tick();

		interval2 = setTimeout(() => {
			elements = elements.map((e) => ({ ...e, fadeOut: true }));
		}, 1550);
	}

	onMount(() => {
		spawnElements();
		interval = setInterval(spawnElements, 3000);
	});

	onDestroy(() => {
		clearInterval(interval);
		clearTimeout(interval2);
	});
</script>

<div bind:this={container} class="tw-container">
	{#each elements as element (element.key)}
		<div
			class="random-element {element.fadeOut ? 'fade-out' : ''}"
			style="top: {element.style.top}; left: {element.style.left};"
			data-key={element.text}
		>
			<Typewriter text={element.text} />
		</div>
	{/each}
</div>

<style>
	.tw-container {
		position: fixed;
		width: 100vw;
		height: 100dvh; /* Adjust this to your container's height */
		border: 1px solid #000;
		overflow: hidden;
		z-index: 50;
	}
	.random-element {
		position: absolute;
		width: 180px; /* Adjust this to your element's width */
		height: 100px; /* Adjust this to your element's height */
		background-color: transparent;
		display: flex;
		justify-content: start;
		align-items: center;
		opacity: 1;
		transition: opacity 1.4s ease-out;
	}
	.fade-out {
		opacity: 0;
	}
	.hide {
		display: none;
	}
</style>
