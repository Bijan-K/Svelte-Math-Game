// src/lib/tabs/play/core/GameState.js

import { generateEquation, validateAnswer } from './EquationGenerator.js';
import { calculateElementLifetime, calculateEquationDifficulty } from './DifficultyConfig.js';

/**
 * Pure game state management for the math game
 * Handles element lifecycle, scoring, and game progression with improved error handling
 */

/**
 * Validate game state structure
 * @param {Object} state - Game state to validate
 * @returns {boolean} True if valid
 */
function validateGameState(state) {
	if (!state || typeof state !== 'object') return false;
	
	const requiredFields = [
		'config', 'elements', 'score', 'health', 'idCounter',
		'isActive', 'isPaused', 'missedEquations', 'fieldDimensions'
	];
	
	return requiredFields.every(field => state.hasOwnProperty(field));
}

/**
 * Create a new game state instance
 * @param {Object} config - Difficulty configuration
 * @returns {Object} Game state object
 */
export function createGameState(config) {
	if (!config || typeof config !== 'object') {
		throw new Error('Invalid config provided to createGameState');
	}

	return {
		config: { ...config }, // Deep copy to prevent mutations
		elements: [],
		score: 0,
		health: config.healthBars || 3,
		idCounter: 0,
		startTime: null,
		lastSpawnTime: null,
		isActive: false,
		isPaused: true,
		missedEquations: [],
		fieldDimensions: { width: 800, height: 600 },
		safeSpawnArea: { width: 680, height: 520, offsetX: 60, offsetY: 40 },
		
		// Statistics tracking
		stats: {
			totalAnswered: 0,
			correctAnswers: 0,
			streak: 0,
			maxStreak: 0,
			elementsSpawned: 0,
			gameStarted: null,
			gameEnded: null
		}
	};
}

/**
 * Start the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state
 */
export function startGame(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to startGame');
	}

	const now = Date.now();
	
	return {
		...gameState,
		isActive: true,
		isPaused: false,
		startTime: now,
		lastSpawnTime: now,
		health: gameState.config.healthBars || 3,
		score: 0,
		elements: [],
		missedEquations: [],
		stats: {
			...gameState.stats,
			totalAnswered: 0,
			correctAnswers: 0,
			streak: 0,
			maxStreak: 0,
			elementsSpawned: 0,
			gameStarted: now,
			gameEnded: null
		}
	};
}

/**
 * Pause the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state
 */
export function pauseGame(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to pauseGame');
	}

	const pauseTime = Date.now();
	
	// Mark all elements with pause timestamp to adjust their timers later
	const pausedElements = gameState.elements.map(element => ({
		...element,
		pausedAt: pauseTime
	}));
	
	return {
		...gameState,
		isPaused: true,
		elements: pausedElements
	};
}

/**
 * Resume the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state
 */
export function resumeGame(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to resumeGame');
	}

	const resumeTime = Date.now();
	
	// Restore timing for all elements by adjusting their start times
	const resumedElements = gameState.elements.map(element => {
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
	
	return {
		...gameState,
		isPaused: false,
		elements: resumedElements
	};
}

/**
 * End the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state with final results
 */
export function endGame(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to endGame');
	}

	return {
		...gameState,
		isActive: false,
		isPaused: true,
		elements: [], // Clear elements on game end
		stats: {
			...gameState.stats,
			gameEnded: Date.now()
		}
	};
}

/**
 * Update field dimensions and safe spawn area
 * @param {Object} gameState - Current game state
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} safeArea - Safe spawn area object
 * @returns {Object} Updated game state
 */
export function updateFieldDimensions(gameState, width, height, safeArea = null) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to updateFieldDimensions');
	}

	if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
		console.warn('Invalid field dimensions provided, using defaults');
		width = 800;
		height = 600;
	}

	const elementWidth = 120;
	const elementHeight = 80;
	const margin = 20;
	
	const calculatedSafeArea = safeArea || {
		width: Math.max(0, width - elementWidth - margin * 2),
		height: Math.max(0, height - elementHeight - margin * 2),
		offsetX: margin,
		offsetY: margin
	};
	
	return {
		...gameState,
		fieldDimensions: { width, height },
		safeSpawnArea: calculatedSafeArea
	};
}

/**
 * Create a new game element at a random position
 * @param {Object} gameState - Current game state
 * @param {boolean} isGolden - Whether this should be a golden element
 * @returns {Object} Updated game state with new element
 */
export function spawnElement(gameState, isGolden = null) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to spawnElement');
	}

	try {
		const equation = generateEquation(gameState.config);
		const elementId = gameState.idCounter + 1;
		
		// Determine if golden (if not specified)
		const shouldBeGolden = isGolden !== null ? isGolden : Math.random() < (gameState.config.goldenChance || 0.15);
		
		// Find non-overlapping position
		const position = findValidSpawnPosition(gameState);
		
		// Calculate element lifetime
		const lifetime = calculateElementLifetime(equation, gameState.config);
		
		const newElement = {
			id: elementId,
			x: position.x,
			y: position.y,
			equation,
			startTime: Date.now(),
			lifetime,
			progress: 100,
			isGolden: shouldBeGolden,
			isExpiring: false,
			state: 'normal' // 'normal', 'correct', 'missed'
		};
		
		return {
			...gameState,
			elements: [...gameState.elements, newElement],
			idCounter: elementId,
			lastSpawnTime: Date.now(),
			stats: {
				...gameState.stats,
				elementsSpawned: gameState.stats.elementsSpawned + 1
			}
		};
	} catch (error) {
		console.error('Error spawning element:', error);
		return gameState; // Return unchanged state on error
	}
}

/**
 * Find a valid spawn position that doesn't overlap with existing elements
 * @param {Object} gameState - Current game state
 * @returns {Object} Position with x, y coordinates
 */
function findValidSpawnPosition(gameState) {
	const { safeSpawnArea } = gameState;
	const elementWidth = 120;
	const elementHeight = 80;
	const maxAttempts = 50;
	
	// Validate safe spawn area
	if (!safeSpawnArea || safeSpawnArea.width <= 0 || safeSpawnArea.height <= 0) {
		console.warn('Invalid safe spawn area, using defaults');
		return { x: 100, y: 100 };
	}
	
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const x = Math.random() * safeSpawnArea.width + safeSpawnArea.offsetX;
		const y = Math.random() * safeSpawnArea.height + safeSpawnArea.offsetY;
		
		// Check for overlaps
		const overlaps = gameState.elements.some(element =>
			isOverlapping(x, y, element.x, element.y, elementWidth, elementHeight)
		);
		
		if (!overlaps) {
			return { x, y };
		}
	}
	
	// If we can't find a non-overlapping position, return a random one anyway
	return {
		x: Math.random() * safeSpawnArea.width + safeSpawnArea.offsetX,
		y: Math.random() * safeSpawnArea.height + safeSpawnArea.offsetY
	};
}

/**
 * Check if two rectangles overlap
 * @param {number} x1 - First rectangle x
 * @param {number} y1 - First rectangle y
 * @param {number} x2 - Second rectangle x
 * @param {number} y2 - Second rectangle y
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @returns {boolean} True if rectangles overlap
 */
function isOverlapping(x1, y1, x2, y2, width, height) {
	return (
		x1 < x2 + width &&
		x1 + width > x2 &&
		y1 < y2 + height &&
		y1 + height > y2
	);
}

/**
 * Update all elements' progress and handle expired elements
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state with element updates and health changes
 */
export function updateElements(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to updateElements');
	}

	const now = Date.now();
	let newHealth = gameState.health;
	let newMissedEquations = [...gameState.missedEquations];
	
	// Update element progress
	const updatedElements = gameState.elements.map(element => {
		try {
			const elapsedTime = now - element.startTime;
			const progress = Math.max(0, 100 - (elapsedTime / element.lifetime) * 100);
			const isExpiring = progress <= 25;
			
			return {
				...element,
				progress,
				isExpiring
			};
		} catch (error) {
			console.error('Error updating element:', error);
			return element; // Return unchanged element on error
		}
	});
	
	// Separate expired elements
	const activeElements = updatedElements.filter(element => element.progress > 0);
	const expiredElements = updatedElements.filter(element => element.progress <= 0);
	
	// Process expired elements
	expiredElements.forEach(element => {
		try {
			// Record missed equation
			newMissedEquations.push({
				equation: element.equation.displayText,
				answer: element.equation.answer,
				difficulty: calculateEquationDifficulty(element.equation, gameState.config),
				timestamp: now
			});
			
			// Reduce health
			newHealth = Math.max(0, newHealth - 1);
		} catch (error) {
			console.error('Error processing expired element:', error);
		}
	});
	
	return {
		...gameState,
		elements: activeElements,
		health: newHealth,
		missedEquations: newMissedEquations,
		stats: {
			...gameState.stats,
			// Reset streak on missed elements
			streak: expiredElements.length > 0 ? 0 : gameState.stats.streak
		}
	};
}

/**
 * Process user input and check for correct answers
 * @param {Object} gameState - Current game state
 * @param {string} userInput - User's input string
 * @returns {Object} Updated game state with score and element changes
 */
export function processInput(gameState, userInput) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to processInput');
	}

	if (typeof userInput !== 'string') {
		console.warn('Invalid user input type provided');
		return gameState;
	}

	const answer = parseInt(userInput.trim());
	
	if (isNaN(answer)) {
		return gameState; // Invalid input, no change
	}
	
	// Find matching element
	const correctElementIndex = gameState.elements.findIndex(element =>
		validateAnswer(element.equation, answer)
	);
	
	if (correctElementIndex === -1) {
		return {
			...gameState,
			stats: {
				...gameState.stats,
				totalAnswered: gameState.stats.totalAnswered + 1,
				streak: 0 // Reset streak on wrong answer
			}
		};
	}
	
	const correctElement = gameState.elements[correctElementIndex];
	let newHealth = gameState.health;
	
	// Handle golden element bonus
	if (correctElement.isGolden) {
		newHealth = Math.min(gameState.config.healthBars || 5, newHealth + 1);
	}
	
	// Mark element as correct and schedule for removal
	const updatedElements = gameState.elements.map((element, index) => {
		if (index === correctElementIndex) {
			return { ...element, state: 'correct' };
		}
		return element;
	});
	
	const newStreak = gameState.stats.streak + 1;
	
	return {
		...gameState,
		elements: updatedElements,
		score: gameState.score + 1,
		health: newHealth,
		stats: {
			...gameState.stats,
			totalAnswered: gameState.stats.totalAnswered + 1,
			correctAnswers: gameState.stats.correctAnswers + 1,
			streak: newStreak,
			maxStreak: Math.max(gameState.stats.maxStreak, newStreak)
		}
	};
}

/**
 * Remove elements marked as correct
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state with correct elements removed
 */
export function removeCorrectElements(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to removeCorrectElements');
	}

	const filteredElements = gameState.elements.filter(element => element.state !== 'correct');
	
	return {
		...gameState,
		elements: filteredElements
	};
}

/**
 * Check if it's time to spawn a new element
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if a new element should be spawned
 */
export function shouldSpawnElement(gameState) {
	if (!validateGameState(gameState)) {
		return false;
	}

	if (!gameState.isActive || gameState.isPaused) {
		return false;
	}
	
	const now = Date.now();
	const timeSinceLastSpawn = now - (gameState.lastSpawnTime || gameState.startTime);
	
	return timeSinceLastSpawn >= (gameState.config.spawnInterval || 30000);
}

/**
 * Check if the game should end (health <= 0)
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if game should end
 */
export function shouldEndGame(gameState) {
	if (!validateGameState(gameState)) {
		return true; // End game if state is invalid
	}

	return gameState.health <= 0;
}

/**
 * Get comprehensive game statistics
 * @param {Object} gameState - Current game state
 * @returns {Object} Game statistics object
 */
export function getGameStats(gameState) {
	if (!validateGameState(gameState)) {
		return {
			score: 0,
			health: 0,
			maxHealth: 3,
			duration: 0,
			totalMissed: 0,
			accuracy: 0,
			elementsOnScreen: 0,
			difficulty: 'unknown'
		};
	}

	const duration = gameState.startTime ? Date.now() - gameState.startTime : 0;
	const totalMissed = gameState.missedEquations.length;
	const totalAnswered = gameState.stats.totalAnswered || (gameState.score + totalMissed);
	const accuracy = totalAnswered > 0 ? (gameState.score / totalAnswered) * 100 : 0;
	
	return {
		score: gameState.score,
		health: gameState.health,
		maxHealth: gameState.config.healthBars || 3,
		duration,
		totalMissed,
		accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
		elementsOnScreen: gameState.elements.length,
		difficulty: gameState.config.id || 'unknown',
		streak: gameState.stats.streak || 0,
		maxStreak: gameState.stats.maxStreak || 0,
		elementsSpawned: gameState.stats.elementsSpawned || 0,
		correctAnswers: gameState.stats.correctAnswers || 0,
		averageResponseTime: duration > 0 && gameState.stats.correctAnswers > 0 
			? duration / gameState.stats.correctAnswers 
			: 0
	};
}

/**
 * Spawn initial elements for game start
 * @param {Object} gameState - Current game state
 * @returns {Object} Updated game state with initial elements
 */
export function spawnInitialElements(gameState) {
	if (!validateGameState(gameState)) {
		throw new Error('Invalid game state provided to spawnInitialElements');
	}

	let updatedState = { ...gameState };
	const initialCount = gameState.config.initialElements || 3;
	
	for (let i = 0; i < initialCount; i++) {
		try {
			updatedState = spawnElement(updatedState);
			// Add small delay between spawns to prevent overlapping
			updatedState = {
				...updatedState,
				lastSpawnTime: updatedState.lastSpawnTime + 200
			};
		} catch (error) {
			console.error(`Error spawning initial element ${i + 1}:`, error);
			// Continue with other elements even if one fails
		}
	}
	
	return updatedState;
}

/**
 * Reset game state for a new game
 * @param {Object} gameState - Current game state
 * @param {Object} newConfig - New difficulty configuration (optional)
 * @returns {Object} Reset game state
 */
export function resetGameState(gameState, newConfig = null) {
	if (!validateGameState(gameState) && !newConfig) {
		throw new Error('Invalid game state and no new config provided to resetGameState');
	}

	const config = newConfig || gameState.config;
	
	return createGameState(config);
}

/**
 * Get element by ID (utility function)
 * @param {Object} gameState - Current game state
 * @param {number} elementId - Element ID to find
 * @returns {Object|null} Element or null if not found
 */
export function getElementById(gameState, elementId) {
	if (!validateGameState(gameState)) {
		return null;
	}

	return gameState.elements.find(element => element.id === elementId) || null;
}

/**
 * Get elements by state (utility function)
 * @param {Object} gameState - Current game state
 * @param {string} state - Element state to filter by
 * @returns {Array} Array of elements matching the state
 */
export function getElementsByState(gameState, state) {
	if (!validateGameState(gameState)) {
		return [];
	}

	return gameState.elements.filter(element => element.state === state);
}