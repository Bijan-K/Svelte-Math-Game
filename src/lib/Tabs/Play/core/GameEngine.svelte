<!-- src/lib/tabs/play/core/GameEngine.svelte -->
<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { cache, record, missed_eq_list } from '$lib/stores.js';
	import { getTodaysDateFormatted } from '$lib/functions.js';
	import { getDifficultyConfig, validateCustomConfig } from './DifficultyConfig.js';
	import { generateEquation, validateAnswer } from './EquationGenerator.js';
	import { calculateElementLifetime } from './DifficultyConfig.js';

	const dispatch = createEventDispatcher();

	// Game state
	let gameConfig = null;
	let gameActive = false;
	let gamePaused = true;
	let health = 0;
	let idCounter = 0;
	let lastSpawnTime = 0;
	let animationFrameId = null;
	let fieldDimensions = null;

	// Exported values
	export let elements = [];
	export let score = 0;
	export let isGamePaused = true;
	export let isGameOver = false;

	// Initialize configuration when difficulty changes
	$: if ($cache.diff !== 'Null') {
		initializeConfig();
	}

	function initializeConfig() {
		if ($cache.diff === 'custom' && $cache.customConfig) {
			gameConfig = validateCustomConfig($cache.customConfig);
		} else {
			gameConfig = getDifficultyConfig($cache.diff);
		}
		health = gameConfig.healthBars || 3;
	}

	// Start a new game
	export function startGame() {
		if (!gameConfig || gameActive) return;

		// Reset game state
		gameActive = true;
		gamePaused = false;
		isGamePaused = false;
		isGameOver = false;
		score = 0;
		elements = [];
		health = gameConfig.healthBars;
		idCounter = 0;
		lastSpawnTime = Date.now();

		// Update cache
		cache.update((c) => ({
			...c,
			gameState: true,
			hp: health,
			score: 0
		}));

		// Spawn initial elements
		for (let i = 0; i < gameConfig.initialElements; i++) {
			spawnElement();
		}

		// Start game loop
		startGameLoop();
	}

	// Pause the game
	export function pauseGame() {
		if (!gameActive || gamePaused) return;

		gamePaused = true;
		isGamePaused = true;
		stopGameLoop();

		cache.update((c) => ({ ...c, gameState: false }));
	}

	// Resume the game
	export function resumeGame() {
		if (!gameActive || !gamePaused) return;

		gamePaused = false;
		isGamePaused = false;
		lastSpawnTime = Date.now(); // Reset spawn timer

		cache.update((c) => ({ ...c, gameState: true }));
		startGameLoop();
	}

	// Quit the game
	export function quitGame() {
		gameActive = false;
		gamePaused = true;
		isGamePaused = true;
		isGameOver = false;
		elements = [];
		score = 0;

		stopGameLoop();

		cache.update((c) => ({
			...c,
			hp: 0,
			score: 0,
			gameState: false,
			userInput: '',
			diff: 'Null'
		}));
	}

	// Process user input
	export function processInput(input) {
		if (!gameActive || gamePaused) return;

		const answer = parseInt(input.trim());
		if (isNaN(answer)) return;

		// Check each element for correct answer
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (validateAnswer(element.equation, answer)) {
				// Correct answer!
				score++;

				// Golden element gives health
				if (element.isGolden && health < gameConfig.healthBars) {
					health++;
				}

				// Mark as correct and remove after animation
				elements[i] = { ...element, state: 'correct' };
				setTimeout(() => {
					elements = elements.filter((el) => el.id !== element.id);
					// Spawn replacement
					if (gameActive && !gamePaused) {
						spawnElement();
					}
				}, 300);

				// Update cache
				cache.update((c) => ({
					...c,
					score: score,
					hp: health,
					userInput: ''
				}));

				return;
			}
		}
	}

	// Update field dimensions
	export function updateFieldDimensions(info) {
		fieldDimensions = info;
	}

	// Spawn a new element
	function spawnElement() {
		if (!gameConfig || !fieldDimensions) return;

		const equation = generateEquation(gameConfig);
		const isGolden = Math.random() < (gameConfig.goldenChance || 0.15);

		// Random position within safe area
		const safeArea = fieldDimensions.safeArea;
		const x = Math.random() * safeArea.width + safeArea.offsetX;
		const y = Math.random() * safeArea.height + safeArea.offsetY;

		const newElement = {
			id: ++idCounter,
			x,
			y,
			equation,
			startTime: Date.now(),
			lifetime: calculateElementLifetime(equation, gameConfig),
			progress: 100,
			isGolden,
			isExpiring: false,
			state: 'normal'
		};

		elements = [...elements, newElement];
	}

	// Main game loop
	function gameLoop() {
		if (!gameActive || gamePaused) return;

		const now = Date.now();
		let healthLost = false;

		// Update elements
		elements = elements.map((element) => {
			const elapsed = now - element.startTime;
			const progress = Math.max(0, 100 - (elapsed / element.lifetime) * 100);

			// Check if expired
			if (progress <= 0 && element.state === 'normal') {
				healthLost = true;
				missed_eq_list.update((list) => {
					const existingIndex = list.findIndex(
						(item) => item.equation === element.equation.displayText
					);
					if (existingIndex >= 0) {
						list[existingIndex].times++;
						list[existingIndex].lastMissed = now;
					} else {
						list.push({
							equation: element.equation.displayText,
							answer: element.equation.answer,
							difficulty: element.equation.difficulty,
							times: 1,
							lastMissed: now
						});
					}
					return list;
				});
				return { ...element, state: 'missed', progress: 0 };
			}

			return {
				...element,
				progress,
				isExpiring: progress <= 25
			};
		});

		// Remove expired elements
		setTimeout(() => {
			elements = elements.filter((el) => el.progress > 0 || el.state === 'correct');
		}, 500);

		// Update health
		if (healthLost) {
			health = Math.max(0, health - 1);
			cache.update((c) => ({ ...c, hp: health }));

			// Check game over
			if (health <= 0) {
				handleGameOver();
				return;
			}
		}

		// Spawn new elements
		if (now - lastSpawnTime >= gameConfig.spawnInterval) {
			spawnElement();
			lastSpawnTime = now;
		}

		// Continue loop
		animationFrameId = requestAnimationFrame(gameLoop);
	}

	// Start/stop game loop
	function startGameLoop() {
		stopGameLoop();
		gameLoop();
	}

	function stopGameLoop() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	// Handle game over
	function handleGameOver() {
		gameActive = false;
		isGameOver = true;
		stopGameLoop();

		// Update records
		record.update((records) => {
			const diffIndex = records.findIndex((r) => r.diff === gameConfig.id);
			if (diffIndex >= 0 && records[diffIndex].count < score) {
				records[diffIndex] = {
					...records[diffIndex],
					count: score,
					date: getTodaysDateFormatted()
				};
			}
			return records;
		});

		cache.update((c) => ({ ...c, gameState: false }));

		// Reset after animation
		setTimeout(() => {
			isGameOver = false;
			elements = [];
		}, 2800);
	}

	// Handle visibility changes
	function handleVisibilityChange() {
		if (document.hidden && gameActive && !gamePaused) {
			pauseGame();
		}
	}

	onMount(() => {
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleVisibilityChange);
	});

	onDestroy(() => {
		stopGameLoop();
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('blur', handleVisibilityChange);
	});

	// Request spawn from parent
	export function requestElementSpawn() {
		dispatch('requestSpawn');
	}
</script>
