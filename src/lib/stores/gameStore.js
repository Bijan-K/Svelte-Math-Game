// src/lib/stores/gameStore.js
import { writable, derived, get } from 'svelte/store';
import { cache, record, missed_eq_list } from '../stores.js';
import { getTodaysDateFormatted } from '../functions.js';
import { getDifficultyConfig, validateCustomConfig, calculateElementLifetime } from '../tabs/play/core/DifficultyConfig.js';
import { generateEquation, validateAnswer } from '../tabs/play/core/EquationGenerator.js';

// Game state store
export const gameState = writable({
	isActive: false,
	isPaused: true,
	isGameOver: false,
	config: null,
	elements: [],
	score: 0,
	health: 0,
	maxHealth: 0,
	idCounter: 0,
	fieldDimensions: { width: 800, height: 600 },
	safeSpawnArea: null
});

// Track active timeouts for cleanup
let elementTimeouts = new Map();
let spawnTimeout = null;

// Initialize game configuration
export function initializeGame(difficulty, customConfig = null) {
	const config = difficulty === 'custom' && customConfig 
		? validateCustomConfig(customConfig)
		: getDifficultyConfig(difficulty);
	
	const maxHealth = config.healthBars || 3;
	
	gameState.update(state => ({
		...state,
		config,
		maxHealth,
		health: maxHealth,
		score: 0,
		elements: [],
		idCounter: 0,
		isActive: false,
		isPaused: true,
		isGameOver: false
	}));

	// Update cache to reflect initialization
	cache.update(c => ({
		...c,
		diff: difficulty,
		hp: maxHealth,
		score: 0,
		gameState: false,
		userInput: '',
		customConfig: difficulty === 'custom' ? config : null
	}));

	return config;
}

// Start the game
export function startGame() {
	const state = get(gameState);
	if (!state.config) return false;

	gameState.update(s => ({
		...s,
		isActive: true,
		isPaused: false
	}));

	// Update cache
	cache.update(c => ({
		...c,
		gameState: true
	}));

	// Spawn initial elements
	spawnInitialElements();
	
	// Schedule next spawn
	scheduleNextSpawn();
	
	return true;
}

// Pause the game
export function pauseGame() {
	gameState.update(s => ({
		...s,
		isPaused: true
	}));

	cache.update(c => ({
		...c,
		gameState: false
	}));

	// Pause all element timers
	pauseElementTimers();
	
	// Clear spawn timer
	if (spawnTimeout) {
		clearTimeout(spawnTimeout);
		spawnTimeout = null;
	}
}

// Resume the game
export function resumeGame() {
	const state = get(gameState);
	if (!state.isActive) return;

	gameState.update(s => ({
		...s,
		isPaused: false
	}));

	cache.update(c => ({
		...c,
		gameState: true
	}));

	// Resume element timers
	resumeElementTimers();
	
	// Schedule next spawn
	scheduleNextSpawn();
}

// Quit the game
export function quitGame() {
	stopAllTimers();
	
	gameState.update(s => ({
		...s,
		isActive: false,
		isPaused: true,
		isGameOver: false,
		elements: [],
		score: 0
	}));

	cache.update(c => ({
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
	const state = get(gameState);
	if (!state.isActive || state.isPaused) return false;

	const answer = parseInt(input.trim());
	if (isNaN(answer)) return false;

	// Check each element for correct answer
	for (let i = 0; i < state.elements.length; i++) {
		const element = state.elements[i];
		if (validateAnswer(element.equation, answer)) {
			// Correct answer!
			const newScore = state.score + 1;
			let newHealth = state.health;

			// Golden element gives health
			if (element.isGolden && newHealth < state.maxHealth) {
				newHealth++;
			}

			// Remove element from state
			gameState.update(s => ({
				...s,
				elements: s.elements.filter(el => el.id !== element.id),
				score: newScore,
				health: newHealth
			}));

			// Update cache
			cache.update(c => ({
				...c,
				score: newScore,
				hp: newHealth,
				userInput: ''
			}));

			// Clear the element's timeout
			if (elementTimeouts.has(element.id)) {
				clearTimeout(elementTimeouts.get(element.id));
				elementTimeouts.delete(element.id);
			}

			// Spawn replacement element
			setTimeout(() => {
				const currentState = get(gameState);
				if (currentState.isActive && !currentState.isPaused) {
					spawnElement();
				}
			}, 100);

			return true;
		}
	}

	return false;
}

// Update field dimensions
export function updateFieldDimensions(dimensions) {
	const elementWidth = 120;
	const elementHeight = 80;
	const margin = 20;

	const safeSpawnArea = {
		width: Math.max(0, dimensions.containerWidth - elementWidth - margin * 2),
		height: Math.max(0, dimensions.containerHeight - elementHeight - margin * 2),
		offsetX: margin,
		offsetY: margin
	};

	gameState.update(s => ({
		...s,
		fieldDimensions: {
			width: dimensions.containerWidth,
			height: dimensions.containerHeight
		},
		safeSpawnArea
	}));
}

// Spawn initial elements
function spawnInitialElements() {
	const state = get(gameState);
	if (!state.config || !state.safeSpawnArea) return;

	for (let i = 0; i < state.config.initialElements; i++) {
		spawnElement();
	}
}

// Spawn a new element
function spawnElement() {
	const state = get(gameState);
	if (!state.config || !state.safeSpawnArea || state.isPaused) return;

	const equation = generateEquation(state.config);
	const isGolden = Math.random() < (state.config.goldenChance || 0.15);
	const lifetime = calculateElementLifetime(equation, state.config);

	// Random position within safe area
	const x = Math.random() * state.safeSpawnArea.width + state.safeSpawnArea.offsetX;
	const y = Math.random() * state.safeSpawnArea.height + state.safeSpawnArea.offsetY;

	const elementId = state.idCounter + 1;
	const newElement = {
		id: elementId,
		x,
		y,
		equation,
		startTime: Date.now(),
		lifetime,
		progress: 100,
		isGolden,
		isExpiring: false,
		state: 'normal'
	};

	// Add element to state
	gameState.update(s => ({
		...s,
		elements: [...s.elements, newElement],
		idCounter: elementId
	}));

	// Schedule element expiration
	scheduleElementExpiration(newElement);
}

// Schedule element expiration
function scheduleElementExpiration(element) {
	const timeoutId = setTimeout(() => {
		const state = get(gameState);
		if (!state.isActive || state.isPaused) return;

		// Element expired - remove it and lose health
		const newHealth = Math.max(0, state.health - 1);

		// Record missed equation
		missed_eq_list.update(list => {
			const existingIndex = list.findIndex(
				item => item.equation === element.equation.displayText
			);
			if (existingIndex >= 0) {
				list[existingIndex].times++;
				list[existingIndex].lastMissed = Date.now();
			} else {
				list.push({
					equation: element.equation.displayText,
					answer: element.equation.answer,
					difficulty: element.equation.difficulty,
					times: 1,
					lastMissed: Date.now()
				});
			}
			return list;
		});

		// Update state
		gameState.update(s => ({
			...s,
			elements: s.elements.filter(el => el.id !== element.id),
			health: newHealth
		}));

		// Update cache
		cache.update(c => ({
			...c,
			hp: newHealth
		}));

		// Clean up timeout
		elementTimeouts.delete(element.id);

		// Check game over
		if (newHealth <= 0) {
			handleGameOver();
		} else {
			// Spawn replacement
			spawnElement();
		}
	}, element.lifetime);

	elementTimeouts.set(element.id, timeoutId);
}

// Schedule next element spawn
function scheduleNextSpawn() {
	const state = get(gameState);
	if (!state.config || state.isPaused) return;

	spawnTimeout = setTimeout(() => {
		const currentState = get(gameState);
		if (currentState.isActive && !currentState.isPaused) {
			spawnElement();
			scheduleNextSpawn(); // Schedule the next one
		}
	}, state.config.spawnInterval);
}

// Pause all element timers
function pauseElementTimers() {
	const state = get(gameState);
	const now = Date.now();
	
	// Mark all elements with pause time
	gameState.update(s => ({
		...s,
		elements: s.elements.map(el => ({
			...el,
			pausedAt: now,
			remainingTime: el.lifetime - (now - el.startTime)
		}))
	}));

	// Clear all timeouts
	elementTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
	elementTimeouts.clear();
}

// Resume all element timers
function resumeElementTimers() {
	const state = get(gameState);
	const now = Date.now();

	// Resume elements with adjusted timing
	gameState.update(s => ({
		...s,
		elements: s.elements.map(el => {
			if (el.pausedAt && el.remainingTime > 0) {
				return {
					...el,
					startTime: now - (el.lifetime - el.remainingTime),
					pausedAt: undefined,
					remainingTime: undefined
				};
			}
			return el;
		})
	}));

	// Reschedule element expirations
	state.elements.forEach(element => {
		if (element.remainingTime > 0) {
			scheduleElementExpiration({
				...element,
				lifetime: element.remainingTime
			});
		}
	});
}

// Stop all timers
function stopAllTimers() {
	// Clear all element timeouts
	elementTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
	elementTimeouts.clear();
	
	// Clear spawn timeout
	if (spawnTimeout) {
		clearTimeout(spawnTimeout);
		spawnTimeout = null;
	}
}

// Handle game over
function handleGameOver() {
	const state = get(gameState);
	
	stopAllTimers();
	
	gameState.update(s => ({
		...s,
		isActive: false,
		isGameOver: true
	}));

	// Update records
	record.update(records => {
		const diffIndex = records.findIndex(r => r.diff === state.config.id);
		if (diffIndex >= 0 && records[diffIndex].count < state.score) {
			records[diffIndex] = {
				...records[diffIndex],
				count: state.score,
				date: getTodaysDateFormatted()
			};
		}
		return records;
	});

	cache.update(c => ({
		...c,
		gameState: false
	}));

	// Reset after animation and return to difficulty selection
	setTimeout(() => {
		gameState.update(s => ({
			...s,
			isGameOver: false,
			elements: [],
			isActive: false,
			isPaused: true
		}));

		// Reset to difficulty selection
		cache.update(c => ({
			...c,
			diff: 'Null',
			hp: 0,
			score: 0,
			userInput: ''
		}));
	}, 3000);
}

// Handle visibility changes
function handleVisibilityChange() {
	const state = get(gameState);
	if (document.hidden && state.isActive && !state.isPaused) {
		pauseGame();
	}
}

// Initialize visibility listeners
if (typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', handleVisibilityChange);
	window.addEventListener('blur', handleVisibilityChange);
}

// Derived stores for easy component access
export const elements = derived(gameState, $gameState => $gameState.elements);
export const score = derived(gameState, $gameState => $gameState.score);
export const health = derived(gameState, $gameState => $gameState.health);
export const maxHealth = derived(gameState, $gameState => $gameState.maxHealth);
export const isGameActive = derived(gameState, $gameState => $gameState.isActive);
export const isGamePaused = derived(gameState, $gameState => $gameState.isPaused);
export const isGameOver = derived(gameState, $gameState => $gameState.isGameOver);