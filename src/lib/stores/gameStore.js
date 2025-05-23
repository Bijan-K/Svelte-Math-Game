// src/lib/stores/gameStore.js - FIXED VERSION
import { writable, derived, get } from 'svelte/store';
import { cache, record, missed_eq_list } from '../stores.js';
import { getTodaysDateFormatted } from '../functions.js';
import { getDifficultyConfig, validateCustomConfig, calculateElementLifetime } from '../tabs/play/core/DifficultyConfig.js';
import { generateEquation, validateAnswer } from '../tabs/play/core/EquationGenerator.js';

// Centralized game state - SINGLE SOURCE OF TRUTH
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
	safeSpawnArea: null,
	// Add timing state to prevent race conditions
	lastSpawnTime: 0,
	gameStartTime: 0,
	pauseStartTime: 0,
	totalPausedTime: 0
});

// Unified timer management to prevent race conditions
class GameTimerManager {
	constructor() {
		this.elementTimers = new Map(); // elementId -> { timeoutId, originalLifetime, pausedAt }
		this.spawnTimer = null;
		this.gameState = null;
		this.unsubscribe = null;
	}

	init(gameStateStore) {
		this.gameState = gameStateStore;
		// Subscribe to state changes to handle timer adjustments
		this.unsubscribe = gameStateStore.subscribe(state => {
			this.handleStateChange(state);
		});
	}

	handleStateChange(state) {
		if (state.isPaused && !this.isPaused) {
			this.pauseAllTimers(state);
		} else if (!state.isPaused && this.isPaused) {
			this.resumeAllTimers(state);
		}
		this.isPaused = state.isPaused;
	}

	scheduleElementExpiration(element, onExpire) {
		if (this.elementTimers.has(element.id)) {
			this.clearElementTimer(element.id);
		}

		const timeoutId = setTimeout(() => {
			// Double-check state at execution time to prevent race conditions
			const currentState = get(this.gameState);
			if (!currentState.isActive || currentState.isPaused) {
				return; // Game state changed, don't expire
			}

			this.elementTimers.delete(element.id);
			onExpire(element);
		}, element.lifetime);

		this.elementTimers.set(element.id, {
			timeoutId,
			originalLifetime: element.lifetime,
			startTime: Date.now(),
			pausedAt: null
		});
	}

	scheduleSpawn(interval, onSpawn) {
		this.clearSpawnTimer();
		
		this.spawnTimer = setTimeout(() => {
			const currentState = get(this.gameState);
			if (currentState.isActive && !currentState.isPaused) {
				onSpawn();
				// Schedule next spawn recursively
				this.scheduleSpawn(interval, onSpawn);
			}
		}, interval);
	}

	pauseAllTimers(state) {
		const pauseTime = Date.now();
		
		// Pause element timers
		for (const [elementId, timer] of this.elementTimers.entries()) {
			clearTimeout(timer.timeoutId);
			timer.pausedAt = pauseTime;
		}

		// Clear spawn timer
		this.clearSpawnTimer();
	}

	resumeAllTimers(state) {
		const resumeTime = Date.now();
		
		// Resume element timers with adjusted lifetimes
		for (const [elementId, timer] of this.elementTimers.entries()) {
			if (timer.pausedAt) {
				const pauseDuration = resumeTime - timer.pausedAt;
				const elapsed = timer.pausedAt - timer.startTime;
				const remainingTime = timer.originalLifetime - elapsed;

				if (remainingTime > 0) {
					// Find the element and reschedule
					const element = state.elements.find(el => el.id === elementId);
					if (element) {
						this.scheduleElementExpiration(
							{ ...element, lifetime: remainingTime },
							this.onElementExpire
						);
					}
				}
			}
		}

		// Resume spawn timer
		if (state.config) {
			this.scheduleSpawn(state.config.spawnInterval, this.onSpawnElement);
		}
	}

	clearElementTimer(elementId) {
		const timer = this.elementTimers.get(elementId);
		if (timer) {
			clearTimeout(timer.timeoutId);
			this.elementTimers.delete(elementId);
		}
	}

	clearSpawnTimer() {
		if (this.spawnTimer) {
			clearTimeout(this.spawnTimer);
			this.spawnTimer = null;
		}
	}

	clearAllTimers() {
		// Clear all element timers
		for (const timer of this.elementTimers.values()) {
			clearTimeout(timer.timeoutId);
		}
		this.elementTimers.clear();

		// Clear spawn timer
		this.clearSpawnTimer();
	}

	destroy() {
		this.clearAllTimers();
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
}

// Create timer manager instance
const timerManager = new GameTimerManager();

// Initialize game configuration
export function initializeGame(difficulty, customConfig = null) {
	const config = difficulty === 'custom' && customConfig 
		? validateCustomConfig(customConfig)
		: getDifficultyConfig(difficulty);
	
	const maxHealth = config.healthBars || 3;
	const now = Date.now();
	
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
		isGameOver: false,
		gameStartTime: now,
		lastSpawnTime: now,
		pauseStartTime: 0,
		totalPausedTime: 0
	}));

	// Sync cache atomically
	cache.update(c => ({
		...c,
		diff: difficulty,
		hp: maxHealth,
		score: 0,
		gameState: false,
		userInput: '',
		customConfig: difficulty === 'custom' ? config : null
	}));

	// Initialize timer manager
	timerManager.init(gameState);

	return config;
}

// Start the game
export function startGame() {
	const state = get(gameState);
	if (!state.config) return false;

	const now = Date.now();

	gameState.update(s => ({
		...s,
		isActive: true,
		isPaused: false,
		gameStartTime: now,
		lastSpawnTime: now,
		totalPausedTime: 0
	}));

	// Sync cache
	cache.update(c => ({ ...c, gameState: true }));

	// Spawn initial elements
	spawnInitialElements();
	
	// Schedule spawning
	timerManager.scheduleSpawn(state.config.spawnInterval, () => {
		spawnElement();
	});
	
	return true;
}

// Pause the game - atomic operation
export function pauseGame() {
	const now = Date.now();
	
	gameState.update(s => ({
		...s,
		isPaused: true,
		pauseStartTime: now
	}));

	cache.update(c => ({ ...c, gameState: false }));
	
	// Timer manager handles pause automatically via subscription
}

// Resume the game - atomic operation
export function resumeGame() {
	const state = get(gameState);
	if (!state.isActive) return;

	const now = Date.now();
	const pauseDuration = state.pauseStartTime > 0 ? now - state.pauseStartTime : 0;

	gameState.update(s => ({
		...s,
		isPaused: false,
		pauseStartTime: 0,
		totalPausedTime: s.totalPausedTime + pauseDuration,
		lastSpawnTime: now // Reset spawn timing
	}));

	cache.update(c => ({ ...c, gameState: true }));
	
	// Timer manager handles resume automatically via subscription
}

// Quit the game - cleanup everything
export function quitGame() {
	timerManager.clearAllTimers();
	
	gameState.update(s => ({
		...s,
		isActive: false,
		isPaused: true,
		isGameOver: false,
		elements: [],
		score: 0,
		gameStartTime: 0,
		lastSpawnTime: 0,
		pauseStartTime: 0,
		totalPausedTime: 0
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

// Process user input - atomic operation
export function processInput(input) {
	const state = get(gameState);
	if (!state.isActive || state.isPaused) return false;

	const answer = parseInt(input.trim());
	if (isNaN(answer)) return false;

	// Find correct element
	const correctElementIndex = state.elements.findIndex(element =>
		validateAnswer(element.equation, answer)
	);

	if (correctElementIndex === -1) return false;

	const correctElement = state.elements[correctElementIndex];
	let newHealth = state.health;

	// Handle golden element bonus
	if (correctElement.isGolden && newHealth < state.maxHealth) {
		newHealth++;
	}

	// Atomic state update
	gameState.update(s => {
		const newElements = s.elements.filter((_, index) => index !== correctElementIndex);
		const newScore = s.score + 1;

		return {
			...s,
			elements: newElements,
			score: newScore,
			health: newHealth
		};
	});

	// Sync cache
	cache.update(c => ({
		...c,
		score: state.score + 1,
		hp: newHealth,
		userInput: ''
	}));

	// Clear the element's timer
	timerManager.clearElementTimer(correctElement.id);

	// Spawn replacement element after short delay
	setTimeout(() => {
		const currentState = get(gameState);
		if (currentState.isActive && !currentState.isPaused) {
			spawnElement();
		}
	}, 100);

	return true;
}

// Element expiration handler
timerManager.onElementExpire = function(element) {
	const state = get(gameState);
	const now = Date.now();

	// Record missed equation
	missed_eq_list.update(list => {
		const existingIndex = list.findIndex(
			item => item.equation === element.equation.displayText
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

	// Atomic state update
	const newHealth = Math.max(0, state.health - 1);
	
	gameState.update(s => ({
		...s,
		elements: s.elements.filter(el => el.id !== element.id),
		health: newHealth
	}));

	// Sync cache
	cache.update(c => ({ ...c, hp: newHealth }));

	// Check game over
	if (newHealth <= 0) {
		handleGameOver();
	} else {
		// Spawn replacement
		spawnElement();
	}
};

// Spawn element handler
timerManager.onSpawnElement = function() {
	spawnElement();
};

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

	// Atomic state update
	gameState.update(s => ({
		...s,
		elements: [...s.elements, newElement],
		idCounter: elementId
	}));

	// Schedule expiration
	timerManager.scheduleElementExpiration(newElement, timerManager.onElementExpire);
}

// Handle game over
function handleGameOver() {
	const state = get(gameState);
	
	timerManager.clearAllTimers();
	
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

	cache.update(c => ({ ...c, gameState: false }));

	// Reset after animation
	setTimeout(() => {
		gameState.update(s => ({
			...s,
			isGameOver: false,
			elements: [],
			isActive: false,
			isPaused: true
		}));

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

// Cleanup timer manager on module unload
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {
		timerManager.destroy();
	});
}

// Derived stores for easy component access
export const elements = derived(gameState, $gameState => $gameState.elements);
export const score = derived(gameState, $gameState => $gameState.score);
export const health = derived(gameState, $gameState => $gameState.health);
export const maxHealth = derived(gameState, $gameState => $gameState.maxHealth);
export const isGameActive = derived(gameState, $gameState => $gameState.isActive);
export const isGamePaused = derived(gameState, $gameState => $gameState.isPaused);
export const isGameOver = derived(gameState, $gameState => $gameState.isGameOver);