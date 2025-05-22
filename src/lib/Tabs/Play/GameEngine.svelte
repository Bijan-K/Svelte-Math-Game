<!-- src/lib/Tabs/Play/GameEngine.svelte -->
<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { cache, record, missed_eq_list } from '$lib/stores.js';
	import { getTodaysDateFormatted } from '$lib/functions.js';

	const dispatch = createEventDispatcher();

	// Game state
	let elements = [];
	let idCounter = 0;
	let score = 0;
	let missedEquations = [];
	let userInput = '';
	let isGamePaused = true;
	let gameStartTime;
	let lastSpawnTime;
	let isGameOver = false;
	let animationFrameId;

	// Enhanced difficulty configuration
	const difficultyConfig = {
		ez: {
			initialElements: 3,
			healthBars: 5,
			spawnInterval: 45000,
			operations: ['+', '-', '*'],
			numberRanges: { min: 1, max: 20 },
			complexityWeight: 1.0,
			goldenChance: 0.15
		},
		mid: {
			initialElements: 4,
			healthBars: 3,
			spawnInterval: 35000,
			operations: ['+', '-', '*', '/', '%', '^'],
			numberRanges: { min: 10, max: 100 },
			complexityWeight: 1.5,
			goldenChance: 0.15
		},
		high: {
			initialElements: 6,
			healthBars: 1,
			spawnInterval: 25000,
			operations: ['+', '-', '*', '/', '%', '^', 'sqrt', 'multi'],
			numberRanges: { min: 25, max: 999 },
			complexityWeight: 2.0,
			goldenChance: 0.15
		}
	};

	$: currentConfig =
		$cache.diff === 'custom'
			? $cache.customConfig
			: $cache.diff
				? difficultyConfig[$cache.diff]
				: null;
	const goldenBoxChance = currentConfig?.goldenChance || 0.15;

	// Export reactive values for other components
	export { elements, score, isGamePaused, isGameOver };

	// Calculate difficulty score for timing
	function calculateDifficultyScore(equation) {
		let score = 0;
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

		const maxNum = Math.max(equation.a, equation.b || 0);
		if (maxNum > 100) score += 2;
		else if (maxNum > 50) score += 1;

		if (equation.operation === 'multi') score += 3;
		return score;
	}

	function calculateElementLifetime(equation, baseTime = 20000) {
		const difficultyScore = calculateDifficultyScore(equation);
		const difficultyMultiplier = currentConfig?.complexityWeight || 1;
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
				const perfectSquares = [
					4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400
				];
				a = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
				answer = Math.sqrt(a);
				displayText = `√${a}`;
				break;
			case 'multi':
				const step1_a = Math.floor(Math.random() * 20) + 5;
				const step1_b = Math.floor(Math.random() * 10) + 2;
				const step2_c = Math.floor(Math.random() * 15) + 3;
				const intermediate = step1_a + step1_b;
				answer = intermediate * step2_c;
				displayText = `(${step1_a}+${step1_b})×${step2_c}`;
				break;
			default:
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

	function createRandomElement(containerWidth = 800, containerHeight = 600) {
		const id = ++idCounter;
		const equation = createEquation();
		const elementWidth = 120;
		const elementHeight = 80;

		let x, y;
		do {
			x = Math.random() * (containerWidth - elementWidth);
			y = Math.random() * (containerHeight - elementHeight);
		} while (isOverlapping(x, y, elementWidth, elementHeight));

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

	function isOverlapping(x, y, elementWidth, elementHeight) {
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

			if ($cache.hp <= 0) {
				endGame();
			} else {
				setTimeout(() => spawnNewElement(), 500);
			}
		});
	}

	function spawnNewElement() {
		// Get current container dimensions
		dispatch('requestSpawn');
	}

	function initialSpawn() {
		for (let i = 0; i < currentConfig.initialElements; i++) {
			spawnNewElement();
		}
	}

	export function startGame() {
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

	export function pauseGame() {
		if (!isGamePaused) {
			isGamePaused = true;
			cancelAnimationFrame(animationFrameId);
			cache.update((n) => ({ ...n, gameState: false }));

			// Save pause timestamp for resume calculation
			const pauseTime = Date.now();
			elements = elements.map((element) => ({
				...element,
				pausedAt: pauseTime
			}));
		}
	}

	export function resumeGame() {
		if (isGamePaused && elements.length > 0) {
			isGamePaused = false;
			cache.update((n) => ({ ...n, gameState: true }));

			// Restore timing for existing elements
			const resumeTime = Date.now();
			elements = elements.map((element) => {
				if (element.pausedAt) {
					const pauseDuration = resumeTime - element.pausedAt;
					return {
						...element,
						startTime: element.startTime + pauseDuration,
						pausedAt: undefined
					};
				}
				return element;
			});

			gameLoop();
		}
	}

	export function quitGame() {
		if (!isGamePaused) pauseGame();

		cancelAnimationFrame(animationFrameId);
		elements = [];
		score = 0;
		missedEquations = [];
		userInput = '';
		isGamePaused = true;
		isGameOver = false;
		idCounter = 0;
		gameStartTime = undefined;
		lastSpawnTime = undefined;

		cache.update((n) => ({
			...n,
			hp: 0,
			score: 0,
			gameState: false,
			userInput: '',
			diff: 'Null'
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

		// Process missed equations
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
					acc.push({ ...curr, lastMissed: curr.timestamp || Date.now() });
				}
				return acc;
			}, []);
			return result;
		}

		missed_eq_list.set(processEquations(missedEquations));

		// Reset
		score = 0;
		missedEquations = [];
		cache.update((n) => ({ ...n, hp: 0, score: 0, gameState: false, userInput: '' }));
	}

	export function processInput(input) {
		const answer = parseInt(input);
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
				setTimeout(() => spawnNewElement(), 200);
			}, 100);
		}
	}

	export function addElement(containerWidth, containerHeight) {
		createRandomElement(containerWidth, containerHeight);
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
		function handleVisibilityChange() {
			if (document.hidden && !isGamePaused) {
				pauseGame();
			}
		}

		function handleWindowBlur() {
			if (!isGamePaused) {
				pauseGame();
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleWindowBlur);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('blur', handleWindowBlur);
		};
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrameId);
	});
</script>
