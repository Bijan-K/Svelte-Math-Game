<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cache } from '$lib/stores.js';
	import GameOver from './GameOver.svelte';

	const containerWidth = 800;
	const containerHeight = 600;
	const elementWidth = 100;
	const elementHeight = 70;
	const elementLifetime = 20000; // 20 seconds 20000

	let elements = [];
	let idCounter = 0;
	let score = 0;
	let missed = 0;
	let missedEquations = [];
	let userInput = '';
	let isGamePaused = true;
	let gameStartTime;
	let lastSpawnTime;
	let isGameOver = false;

	const difficultyConfig = {
		ez: {
			initialElements: 3,
			healthBars: 5,
			spawnInterval: 60000 // 1 minute
		},
		mid: {
			initialElements: 4,
			healthBars: 3,
			spawnInterval: 60000 // 1 minute
		},
		high: {
			initialElements: 7,
			healthBars: 1,
			spawnInterval: 20000 // 20 seconds
		}
	};

	$: currentConfig = $cache.diff ? difficultyConfig[$cache.diff] : null;

	function createEquation() {
		const operations = ['+', '-', '*', '/'];
		const operation = operations[Math.floor(Math.random() * operations.length)];
		let a, b, answer;

		switch (operation) {
			case '+':
				a = Math.floor(Math.random() * 30) + 1;
				b = Math.floor(Math.random() * 20) + 1;
				answer = a + b;
				break;
			case '-':
				a = Math.floor(Math.random() * 30) + 20;
				b = Math.floor(Math.random() * 20) + 1;
				answer = a - b;
				break;
			case '*':
				a = Math.floor(Math.random() * 10) + 1;
				b = Math.floor(Math.random() * 10) + 1;
				answer = a * b;
				break;
			case '/':
				b = Math.floor(Math.random() * 9) + 2;
				answer = Math.floor(Math.random() * 10) + 1;
				a = b * answer;
				break;
		}

		return { a, operation, b, answer };
	}

	function createRandomElement() {
		const id = ++idCounter;
		const equation = createEquation();
		let x, y;
		do {
			x = Math.random() * (containerWidth - elementWidth);
			y = Math.random() * (containerHeight - elementHeight);
		} while (isOverlapping(x, y));

		const newElement = { id, x, y, progress: 100, equation, startTime: Date.now() };
		elements = [...elements, newElement];
		return newElement;
	}

	function isOverlapping(x, y) {
		return elements.some(
			(el) =>
				x < el.x + elementWidth &&
				x + elementWidth > el.x &&
				y < el.y + elementHeight &&
				y + elementHeight > el.y
		);
	}

	function updateElementProgress() {
		const now = Date.now();
		elements = elements.map((element) => {
			const elapsedTime = now - element.startTime;
			const progress = Math.max(0, 100 - (elapsedTime / elementLifetime) * 100);
			const isExpiring = progress <= 25;
			return { ...element, progress, isExpiring };
		});

		const expiredElements = elements.filter((element) => element.progress <= 0);
		elements = elements.filter((element) => element.progress > 0);

		expiredElements.forEach((element) => {
			missedEquations = [
				...missedEquations,
				`${element.equation.a} ${element.equation.operation} ${element.equation.b}`
			];
			missed++;
			cache.update((c) => ({ ...c, hp: c.hp - 1 }));
			if ($cache.hp <= 0) {
				endGame();
			} else {
				spawnNewElement();
			}
		});
	}

	function spawnNewElement() {
		setTimeout(() => {
			createRandomElement();
		}, 100);
	}

	function initialSpawn() {
		for (let i = 0; i < currentConfig.initialElements; i++) {
			createRandomElement();
		}
	}

	let animationFrameId;

	function startGame() {
		if (isGamePaused && $cache.diff) {
			isGamePaused = false;
			cache.update((n) => ({ ...n, gameState: true }));
			gameStartTime = Date.now();
			lastSpawnTime = gameStartTime;
			console.log(currentConfig);
			cache.update((c) => ({ ...c, hp: currentConfig.healthBars }));
			initialSpawn();
			gameLoop();
		}
	}

	function endGame() {
		isGameOver = true;
		cache.update((n) => ({ ...n, gameState: false }));

		setTimeout(() => {
			isGameOver = false;
			isGamePaused = true;
		}, 2800);

		cancelAnimationFrame(animationFrameId);
		elements = [];

		// Additional end game logic here
	}

	function handleKeydown(event) {
		if (isGamePaused && event.key === 'Enter') {
			startGame();
			return;
		}

		if (!isGamePaused) {
			if ((event.key >= '0' && event.key <= '9') || (event.key === '-' && userInput === '')) {
				userInput += event.key;
				cache.update((n) => ({ ...n, userInput: userInput }));
			} else if (event.key === 'Backspace') {
				userInput = userInput.slice(0, -1);
				cache.update((n) => ({ ...n, userInput: userInput }));
			} else if (event.key === 'Enter') {
				const answer = parseInt(userInput);
				const correctElementIndex = elements.findIndex((el) => el.equation.answer === answer);
				if (correctElementIndex !== -1) {
					elements = elements.filter((_, index) => index !== correctElementIndex);
					score++;
					cache.update((n) => ({ ...n, score: score }));
					spawnNewElement();
				}
				userInput = '';
				cache.update((n) => ({ ...n, userInput: userInput }));
			}
		}
	}

	function gameLoop() {
		if (!isGamePaused) {
			const now = Date.now();
			updateElementProgress();

			if (now - lastSpawnTime >= currentConfig.spawnInterval) {
				spawnNewElement();
				lastSpawnTime = now;
			}

			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="container" on:click={startGame}>
	{#if isGamePaused}
		<div class="start-message" in:fade={{ duration: 200 }}>
			<span>Select difficulty and Press Enter to Start</span>
		</div>
	{:else if isGameOver}
		<div class="start-message" in:fade={{ duration: 200 }}>
			<GameOver />
		</div>
	{:else}
		{#each elements as element (element.id)}
			<div
				class="element"
				style="left: {element.x}px; top: {element.y}px;"
				in:fade={{ duration: 200 }}
				out:fade={{ duration: 200 }}
			>
				<div class="equation-top">{element.equation.a} {element.equation.operation}</div>
				<div class="equation-bottom">{element.equation.b}</div>
				<div class="progress-bar">
					<div
						class="progress"
						class:expiring={element.isExpiring}
						style="width: {element.progress}%;"
					></div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.start-message {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.start-message span {
		font-size: calc(16px + 1vw);
	}

	:global(body) {
		background-color: #121212;
		color: white;
	}

	.container {
		position: relative;
		width: 80vw;
		height: 88vh;
		overflow: hidden;
		background-color: transparent;
	}
	.element {
		position: absolute;
		width: 100px;
		height: 70px;
		background-color: #333333;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		border-radius: 4px;
		border: 1px solid white;
		color: white;
		font-size: 18px;
		padding: 5px;
	}
	.equation-top,
	.equation-bottom {
		width: 100%;
		text-align: center;
	}
	.equation-top {
		margin-bottom: 5px;
	}
	.progress-bar {
		width: 100%;
		height: 5px;
		background-color: #555555;
		border-radius: 2px;
		overflow: hidden;
		margin-top: 5px;
	}

	.progress {
		height: 100%;
		background-color: #4caf50;
		transition: width 0.1s linear;
	}

	.progress.expiring {
		animation: flash 0.5s linear infinite alternate;
	}

	@keyframes flash {
		0% {
			background-color: #4caf50;
		}
		100% {
			background-color: #ff0000;
		}
	}
</style>
