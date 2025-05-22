<!-- src/lib/Tabs/Play/GameContainer.svelte -->
<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cache, record, missed_eq_list, functionTriggerEnter } from '$lib/stores.js';
	import { getTodaysDateFormatted } from '$lib/functions.js';

	import GameOver from './GameOver.svelte';

	let containerWidth = 800;
	let containerHeight = 600;
	const elementWidth = 100;
	const elementHeight = 70;

	let elements = [];
	let idCounter = 0;
	let score = 0;
	let missedEquations = [];
	let userInput = '';
	let isGamePaused = true;
	let gameStartTime;
	let lastSpawnTime;
	let isGameOver = false;

	// Enhanced difficulty configuration with sophisticated arithmetic
	const difficultyConfig = {
		ez: {
			initialElements: 3,
			healthBars: 5,
			spawnInterval: 45000, // 45 seconds
			operations: ['+', '-', '*'],
			numberRanges: { min: 1, max: 20 },
			complexityWeight: 1.0
		},
		mid: {
			initialElements: 4,
			healthBars: 3,
			spawnInterval: 35000, // 35 seconds
			operations: ['+', '-', '*', '/', '%', '^'],
			numberRanges: { min: 10, max: 100 },
			complexityWeight: 1.5
		},
		high: {
			initialElements: 6,
			healthBars: 1,
			spawnInterval: 25000, // 25 seconds
			operations: ['+', '-', '*', '/', '%', '^', 'sqrt', 'multi'],
			numberRanges: { min: 25, max: 999 },
			complexityWeight: 2.0
		}
	};

	$: currentConfig = $cache.diff ? difficultyConfig[$cache.diff] : null;

	const goldenBoxChance = 0.15; // 15% chance for a golden box

	// Safe math evaluator - replaces dangerous eval()
	function safeMathEvaluate(expression) {
		// Remove all whitespace
		expression = expression.replace(/\s/g, '');

		// Parse and validate the expression
		const validPattern = /^[-+]?\d*\.?\d+([+\-*/%^][-+]?\d*\.?\d+)*$/;
		if (!validPattern.test(expression)) {
			throw new Error('Invalid mathematical expression');
		}

		try {
			// Handle special cases
			if (expression.includes('^')) {
				expression = expression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
			}
			if (expression.includes('%')) {
				expression = expression.replace(/(\d+)%(\d+)/g, '($1 % $2)');
			}

			// Use Function constructor for safer evaluation
			return new Function('return ' + expression)();
		} catch (error) {
			throw new Error('Mathematical evaluation failed');
		}
	}

	// Calculate difficulty score for timing
	function calculateDifficultyScore(equation) {
		let score = 0;

		// Operation complexity
		const opComplexity = {
			'+': 1,
			'-': 1,
			'*': 2,
			'/': 3,
			'%': 3,
			'^': 4,
			sqrt: 4
		};
		score += opComplexity[equation.operation] || 1;

		// Number size complexity
		const maxNum = Math.max(equation.a, equation.b || 0);
		if (maxNum > 100) score += 2;
		else if (maxNum > 50) score += 1;

		// Multi-step complexity
		if (equation.operation === 'multi') score += 3;

		return score;
	}

	// Calculate element lifetime based on difficulty
	function calculateElementLifetime(equation, baseTime = 20000) {
		const difficultyScore = calculateDifficultyScore(equation);
		const difficultyMultiplier = currentConfig?.complexityWeight || 1;

		// More time for harder problems
		const timeMultiplier = 1 + difficultyScore * 0.3 * difficultyMultiplier;
		return Math.floor(baseTime * timeMultiplier);
	}

	function createEquation() {
		const config = currentConfig;
		if (!config) return { a: 1, operation: '+', b: 1, answer: 2, difficulty: 1 };

		const operations = config.operations;
		const operation = operations[Math.floor(Math.random() * operations.length)];
		let a, b, answer, displayText;

		const { min, max } = config.numberRanges;

		switch (operation) {
			case '+':
				a = Math.floor(Math.random() * (max - min)) + min;
				b = Math.floor(Math.random() * (max - min)) + min;
				answer = a + b;
				displayText = `${a} + ${b}`;
				break;

			case '-':
				a = Math.floor(Math.random() * (max - min)) + min + 20;
				b = Math.floor(Math.random() * Math.min(a - 1, max - min)) + min;
				answer = a - b;
				displayText = `${a} - ${b}`;
				break;

			case '*':
				const maxFactor =
					config === difficultyConfig.ez ? 12 : config === difficultyConfig.mid ? 25 : 50;
				a = Math.floor(Math.random() * maxFactor) + 2;
				b = Math.floor(Math.random() * maxFactor) + 2;
				answer = a * b;
				displayText = `${a} × ${b}`;
				break;

			case '/':
				// Ensure clean division
				const divisors =
					config === difficultyConfig.mid
						? [2, 3, 4, 5, 6, 8, 9, 10, 12, 15]
						: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 25];
				b = divisors[Math.floor(Math.random() * divisors.length)];
				answer = Math.floor(Math.random() * 20) + 2;
				a = b * answer;
				displayText = `${a} ÷ ${b}`;
				break;

			case '%':
				a = Math.floor(Math.random() * 100) + 50;
				b = Math.floor(Math.random() * 20) + 3;
				answer = a % b;
				displayText = `${a} % ${b}`;
				break;

			case '^':
				a = Math.floor(Math.random() * 12) + 2;
				b = Math.floor(Math.random() * 4) + 2;
				answer = Math.pow(a, b);
				displayText = `${a}^${b}`;
				break;

			case 'sqrt':
				// Perfect squares only
				const perfectSquares = [
					4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400
				];
				a = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
				answer = Math.sqrt(a);
				displayText = `√${a}`;
				break;

			case 'multi':
				// Multi-step operations
				const step1_a = Math.floor(Math.random() * 20) + 5;
				const step1_b = Math.floor(Math.random() * 10) + 2;
				const step2_c = Math.floor(Math.random() * 15) + 3;
				const intermediate = step1_a + step1_b;
				answer = intermediate * step2_c;
				displayText = `(${step1_a}+${step1_b})×${step2_c}`;
				break;

			default:
				// Fallback
				a = Math.floor(Math.random() * 20) + 1;
				b = Math.floor(Math.random() * 20) + 1;
				answer = a + b;
				displayText = `${a} + ${b}`;
		}

		return {
			a,
			operation,
			b,
			answer: Math.round(answer),
			displayText: displayText || `${a} ${operation} ${b}`,
			difficulty: calculateDifficultyScore({ a, operation, b })
		};
	}

	function createRandomElement() {
		const id = ++idCounter;
		const equation = createEquation();
		let x, y;
		do {
			x = Math.random() * (containerWidth - elementWidth);
			y = Math.random() * (containerHeight - elementHeight);
		} while (isOverlapping(x, y));

		const isGolden = Math.random() < goldenBoxChance;
		const elementLifetime = calculateElementLifetime(equation);

		const newElement = {
			id,
			x,
			y,
			progress: 100,
			equation,
			startTime: Date.now(),
			lifetime: elementLifetime,
			isGolden,
			state: 'normal'
		};
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
			const progress = Math.max(0, 100 - (elapsedTime / element.lifetime) * 100);
			const isExpiring = progress <= 25;
			return { ...element, progress, isExpiring };
		});

		const expiredElements = elements.filter((element) => element.progress <= 0);
		elements = elements.filter((element) => element.progress > 0);

		expiredElements.forEach((element) => {
			missedEquations = [
				...missedEquations,
				{
					equation: element.equation.displayText,
					answer: element.equation.answer,
					difficulty: element.equation.difficulty,
					timestamp: Date.now()
				}
			];
			cache.update((c) => ({ ...c, hp: c.hp - 1 }));
			element.state = 'missed';
			setTimeout(() => {
				elements = elements.filter((el) => el.id !== element.id);
			}, 500);
			if ($cache.hp <= 0) {
				endGame();
			} else {
				setTimeout(spawnNewElement, 500);
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
		if (isGamePaused && $cache.diff !== 'Null') {
			isGamePaused = false;
			cache.update((n) => ({ ...n, gameState: true }));
			gameStartTime = Date.now();
			lastSpawnTime = gameStartTime;
			cache.update((c) => ({ ...c, hp: currentConfig.healthBars }));
			initialSpawn();
			gameLoop();
		}
	}

	function pauseGame() {
		if (!isGamePaused) {
			isGamePaused = true;
			cancelAnimationFrame(animationFrameId);
			cache.update((n) => ({ ...n, gameState: false }));
		}
	}

	function resumeGame() {
		if (isGamePaused && elements.length > 0) {
			isGamePaused = false;
			cache.update((n) => ({ ...n, gameState: true }));
			// Reset timing for existing elements
			const now = Date.now();
			elements = elements.map((element) => ({
				...element,
				startTime: now - ((100 - element.progress) / 100) * element.lifetime
			}));
			gameLoop();
		}
	}

	function quitGame() {
		if (!isGamePaused) {
			pauseGame();
		}

		// Reset everything without saving stats
		cancelAnimationFrame(animationFrameId);
		elements = [];
		score = 0;
		missedEquations = [];
		isGamePaused = true;

		cache.update((n) => ({
			...n,
			hp: 0,
			score: 0,
			gameState: false,
			userInput: ''
		}));
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

		// Check for high score
		let index = $record.findIndex((el) => el.diff == $cache.diff);
		if (index != -1) {
			if ($record[index].count < score) {
				record.update((n) => {
					n[index] = { ...n[index], count: score, date: getTodaysDateFormatted() };
					return n;
				});
			}
		}

		// Process missed equations safely
		function processEquations(equations) {
			let formerList = $missed_eq_list;

			const equationObjects = equations.map((eq) => ({
				equation: eq.equation,
				answer: eq.answer,
				difficulty: eq.difficulty,
				timestamp: eq.timestamp,
				times: 1
			}));

			formerList.push(...equationObjects);

			const result = formerList.reduce((acc, curr) => {
				const existingEq = acc.find((item) => item.equation === curr.equation);
				if (existingEq) {
					existingEq.times++;
					existingEq.lastMissed = Math.max(existingEq.lastMissed || 0, curr.timestamp || 0);
				} else {
					acc.push({
						...curr,
						lastMissed: curr.timestamp || Date.now()
					});
				}
				return acc;
			}, []);

			return result;
		}

		missed_eq_list.set(processEquations(missedEquations));

		// reset
		score = 0;
		missedEquations = [];
		cache.update((n) => ({
			...n,
			hp: 0,
			score: 0,
			gameState: false,
			userInput: ''
		}));
	}

	function handleKeydown(event) {
		if (isGamePaused && event.key === 'Enter' && $cache.diff !== 'Null') {
			startGame();
			return;
		}

		// Allow resume with Enter when paused mid-game
		if (isGamePaused && event.key === 'Enter' && elements.length > 0) {
			resumeGame();
			return;
		}

		// Quit game with Escape
		if (event.key === 'Escape' && !isGamePaused) {
			quitGame();
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
				const answer = parseInt($cache.userInput);
				const correctElementIndex = elements.findIndex((el) => el.equation.answer === answer);
				if (correctElementIndex !== -1) {
					const correctElement = elements[correctElementIndex];
					correctElement.state = 'correct';
					score++;
					cache.update((n) => ({ ...n, score: score }));
					if (correctElement.isGolden) {
						cache.update((c) => ({ ...c, hp: c.hp + 1 }));
					}
					setTimeout(() => {
						elements = elements.filter((_, index) => index !== correctElementIndex);
						setTimeout(spawnNewElement, 200);
					}, 100);
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
		// Handle visibility changes (tab switching, window minimizing, etc.)
		function handleVisibilityChange() {
			if (document.hidden && !isGamePaused) {
				// Pause the game when tab becomes hidden
				pauseGame();
			}
		}

		// Handle window blur (losing focus)
		function handleWindowBlur() {
			if (!isGamePaused) {
				pauseGame();
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleWindowBlur);
		window.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('blur', handleWindowBlur);
			window.removeEventListener('keydown', handleKeydown);
			cancelAnimationFrame(animationFrameId);
		};
	});

	$: if ($functionTriggerEnter) {
		const answer = parseInt($cache.userInput);
		const correctElementIndex = elements.findIndex((el) => el.equation.answer === answer);
		if (correctElementIndex !== -1) {
			const correctElement = elements[correctElementIndex];
			correctElement.state = 'correct';
			score++;
			cache.update((n) => ({ ...n, score: score }));
			if (correctElement.isGolden) {
				cache.update((c) => ({ ...c, hp: c.hp + 1 }));
			}
			setTimeout(() => {
				elements = elements.filter((_, index) => index !== correctElementIndex);
				setTimeout(spawnNewElement, 200);
			}, 100);
		}
		userInput = '';
		cache.update((n) => ({ ...n, userInput: userInput }));
		functionTriggerEnter.update((n) => false);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="container"
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	on:click={startGame}
>
	{#if isGamePaused}
		<div class="start-message" in:fade={{ duration: 200 }}>
			{#if elements.length > 0}
				<div class="pause-menu">
					<h2>Game Paused</h2>
					<p>Press Enter to continue or Escape to quit</p>
					<div class="pause-buttons">
						<button class="resume-btn" on:click={resumeGame}>Resume</button>
						<button class="quit-btn" on:click={quitGame}>Quit Game</button>
					</div>
				</div>
			{:else}
				<span>Select difficulty and Press Enter to Start</span>
			{/if}
		</div>
	{:else if isGameOver}
		<div class="start-message" in:fade={{ duration: 200 }}>
			<GameOver />
		</div>
	{:else}
		<!-- Game UI with quit button -->
		<button class="quit-button" on:click={quitGame} title="Quit Game (Escape)"> ✕ </button>

		{#each elements as element (element.id)}
			<div
				class="element"
				class:golden={element.isGolden}
				class:correct={element.state === 'correct'}
				class:missed={element.state === 'missed'}
				class:hard-problem={element.equation.difficulty >= 3}
				style="left: {element.x}px; top: {element.y}px;"
				in:fade={{ duration: 200 }}
				out:fade={{ duration: 200 }}
				animate:scale={{ start: element.state === 'correct' ? 1.2 : 0.8, duration: 500 }}
			>
				<div class="equation-display">
					{element.equation.displayText}
				</div>
				<div class="progress-bar">
					<div
						class="progress"
						class:expiring={element.isExpiring}
						style="width: {element.progress}%;"
					></div>
				</div>
				{#if element.equation.difficulty >= 3}
					<div class="difficulty-indicator">★</div>
				{/if}
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
		height: 88dvh;
		overflow: hidden;
		background-color: transparent;
	}

	@media (max-width: 768px) {
		.container {
			width: 100vw;
			height: 68dvh;
		}
	}

	.element {
		position: absolute;
		width: 120px;
		height: 80px;
		background-color: #1a1a1a;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		border-radius: 6px;
		border: 2px solid #333;
		color: white;
		font-size: 16px;
		padding: 8px;
		transition: all 0.3s ease;
	}

	.equation-display {
		width: 100%;
		text-align: center;
		font-weight: 600;
		margin-bottom: 6px;
		font-family: 'Courier New', monospace;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background-color: #444;
		border-radius: 3px;
		overflow: hidden;
		margin-top: 4px;
	}

	.progress {
		height: 100%;
		background: linear-gradient(90deg, #4caf50, #2196f3);
		transition: width 0.1s linear;
	}

	.progress.expiring {
		animation: flash 0.5s linear infinite alternate;
	}

	.difficulty-indicator {
		position: absolute;
		top: 2px;
		right: 4px;
		color: #ffd700;
		font-size: 12px;
		font-weight: bold;
	}

	@keyframes flash {
		0% {
			background: linear-gradient(90deg, #4caf50, #2196f3);
		}
		100% {
			background: linear-gradient(90deg, #ff4444, #ff8800);
		}
	}

	.element.golden {
		background: linear-gradient(135deg, #ffd700, #ffed4e);
		color: #000;
		border-color: #daa520;
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
	}

	.element.hard-problem {
		border-color: #9c27b0;
		background-color: #2d1b69;
	}

	.element.correct {
		background: linear-gradient(135deg, #4caf50, #66bb6a);
		border-color: #45a049;
		transform: scale(120%);
		transition: all 0.2s;
	}

	.element.missed {
		background: linear-gradient(135deg, #f44336, #ef5350);
		border-color: #d32f2f;
		transform: scale(80%);
		transition: all 0.2s;
	}

	.quit-button {
		position: absolute;
		top: 20px;
		right: 20px;
		width: 40px;
		height: 40px;
		border: 2px solid #fff;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border-radius: 50%;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		z-index: 100;
	}

	.quit-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.quit-button:active {
		transform: scale(0.9);
	}

	.pause-menu {
		text-align: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid #fff;
		border-radius: 12px;
		max-width: 400px;
	}

	.pause-menu h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #fff;
	}

	.pause-menu p {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		color: #ccc;
	}

	.pause-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.resume-btn,
	.quit-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid #fff;
		background: transparent;
		color: #fff;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.resume-btn:hover {
		background: #fff;
		color: #000;
	}

	.quit-btn:hover {
		background: #333;
		border-color: #999;
	}
</style>
