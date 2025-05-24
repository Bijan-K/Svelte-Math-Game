// src/lib/tabs/play/core/DifficultyConfig.js

/**
 * Centralized difficulty configuration for the math game
 * Defines all parameters for each difficulty level
 */

export const DIFFICULTY_LEVELS = {
	ez: {
		id: 'ez',
		name: 'Easy',
		description: 'Basic arithmetic with small numbers',
		color: '#10b981',
		initialElements: 3,
		healthBars: 5,
		spawnInterval: 45000, // 45 seconds
		operations: ['+', '-', '*'],
		numberRanges: { min: 1, max: 20 },
		complexityWeight: 1.0,
		goldenChance: 0.15, // 15% chance for bonus equations
		baseElementLifetime: 25000 // 25 seconds base time
	},
	
	mid: {
		id: 'mid',
		name: 'Medium', 
		description: 'More operations and larger numbers',
		color: '#f59e0b',
		initialElements: 4,
		healthBars: 3,
		spawnInterval: 35000, // 35 seconds
		operations: ['+', '-', '*', '/', '%', '^'],
		numberRanges: { min: 10, max: 100 },
		complexityWeight: 1.5,
		goldenChance: 0.15,
		baseElementLifetime: 22000 // 22 seconds base time
	},
	
	high: {
		id: 'high',
		name: 'Hard',
		description: 'Complex operations and multi-step problems',
		color: '#ef4444',
		initialElements: 6,
		healthBars: 1,
		spawnInterval: 25000, // 25 seconds
		operations: ['+', '-', '*', '/', '%', '^', 'sqrt', 'multi'],
		numberRanges: { min: 25, max: 999 },
		complexityWeight: 2.0,
		goldenChance: 0.15,
		baseElementLifetime: 20000 // 20 seconds base time
	}
};

// Default custom difficulty template
export const DEFAULT_CUSTOM_CONFIG = {
	id: 'custom',
	name: 'Custom',
	description: 'User-defined difficulty settings',
	color: '#8b5cf6',
	healthBars: 3,
	spawnInterval: 30000,
	initialElements: 4,
	operations: ['+', '-', '*'],
	numberRanges: { min: 1, max: 50 },
	complexityWeight: 1.2,
	goldenChance: 0.15,
	baseElementLifetime: 23000
};

/**
 * Operation complexity weights for calculating element lifetime
 */
export const OPERATION_COMPLEXITY = {
	'+': 1,
	'-': 1,
	'*': 2,
	'/': 3,
	'%': 3,
	'^': 4,
	'sqrt': 4,
	'multi': 5
};

/**
 * Get difficulty configuration by ID
 * @param {string} difficultyId - The difficulty level ID
 * @returns {Object} Difficulty configuration object
 */
export function getDifficultyConfig(difficultyId) {
	if (difficultyId === 'custom') {
		return DEFAULT_CUSTOM_CONFIG;
	}
	
	return DIFFICULTY_LEVELS[difficultyId] || DIFFICULTY_LEVELS.ez;
}

/**
 * Get all available difficulty levels
 * @returns {Array} Array of difficulty configurations
 */
export function getAllDifficulties() {
	return Object.values(DIFFICULTY_LEVELS);
}

/**
 * Validate custom difficulty configuration
 * @param {Object} config - Custom configuration object
 * @returns {Object} Validated and sanitized configuration
 */
export function validateCustomConfig(config) {
	const validated = { ...DEFAULT_CUSTOM_CONFIG };
	
	// Validate and clamp health bars (1-10)
	if (typeof config.healthBars === 'number') {
		validated.healthBars = Math.max(1, Math.min(10, Math.floor(config.healthBars)));
	}
	
	// Validate and clamp spawn interval (10-120 seconds)
	if (typeof config.spawnInterval === 'number') {
		validated.spawnInterval = Math.max(10000, Math.min(120000, config.spawnInterval));
	}
	
	// Validate and clamp initial elements (1-10)
	if (typeof config.initialElements === 'number') {
		validated.initialElements = Math.max(1, Math.min(10, Math.floor(config.initialElements)));
	}
	
	// Validate operations array
	if (Array.isArray(config.operations) && config.operations.length > 0) {
		const validOps = ['+', '-', '*', '/', '%', '^', 'sqrt', 'multi'];
		validated.operations = config.operations.filter(op => validOps.includes(op));
		
		// Ensure at least one operation
		if (validated.operations.length === 0) {
			validated.operations = ['+'];
		}
	}
	
	// Validate number ranges
	if (config.numberRanges && typeof config.numberRanges === 'object') {
		const min = Math.max(1, Math.min(100, config.numberRanges.min || 1));
		const max = Math.max(min + 1, Math.min(1000, config.numberRanges.max || 50));
		validated.numberRanges = { min, max };
	}
	
	// Validate complexity weight (0.5-3.0)
	if (typeof config.complexityWeight === 'number') {
		validated.complexityWeight = Math.max(0.5, Math.min(3.0, config.complexityWeight));
	}
	
	// Validate golden chance (0-50%)
	if (typeof config.goldenChance === 'number') {
		validated.goldenChance = Math.max(0, Math.min(0.5, config.goldenChance));
	}
	
	// Calculate base element lifetime based on complexity
	validated.baseElementLifetime = calculateBaseLifetime(validated.complexityWeight);
	
	return validated;
}

/**
 * Calculate base element lifetime based on complexity weight
 * @param {number} complexityWeight - The complexity multiplier
 * @returns {number} Base lifetime in milliseconds
 */
function calculateBaseLifetime(complexityWeight) {
	// Base time of 25 seconds, modified by complexity
	const baseTime = 25000;
	const timeMultiplier = 1 + (complexityWeight - 1) * 0.3;
	return Math.floor(baseTime / timeMultiplier);
}

/**
 * Get difficulty color theme
 * @param {string} difficultyId - The difficulty level ID
 * @returns {Object} Color theme object
 */
export function getDifficultyTheme(difficultyId) {
	const themes = {
		ez: { 
			primary: '#10b981', 
			secondary: '#065f46', 
			accent: '#34d399',
			background: 'linear-gradient(135deg, #064e3b, #065f46)'
		},
		mid: { 
			primary: '#f59e0b', 
			secondary: '#92400e', 
			accent: '#fbbf24',
			background: 'linear-gradient(135deg, #78350f, #92400e)'
		},
		high: { 
			primary: '#ef4444', 
			secondary: '#991b1b', 
			accent: '#f87171',
			background: 'linear-gradient(135deg, #7f1d1d, #991b1b)'
		},
		custom: { 
			primary: '#8b5cf6', 
			secondary: '#5b21b6', 
			accent: '#a78bfa',
			background: 'linear-gradient(135deg, #4c1d95, #5b21b6)'
		}
	};
	
	return themes[difficultyId] || themes.ez;
}

/**
 * Calculate difficulty score for an equation (used for timing calculations)
 * @param {Object} equation - The equation object
 * @param {Object} config - Difficulty configuration
 * @returns {number} Difficulty score
 */
export function calculateEquationDifficulty(equation, config) {
	let score = 0;
	
	// Base complexity from operation
	score += OPERATION_COMPLEXITY[equation.operation] || 1;
	
	// Add complexity based on number size
	const maxNum = Math.max(equation.a, equation.b || 0);
	if (maxNum > 100) score += 2;
	else if (maxNum > 50) score += 1;
	
	// Multi-step operations get extra complexity
	if (equation.operation === 'multi') score += 3;
	
	// Apply difficulty weight
	score *= config.complexityWeight;
	
	return Math.max(1, Math.floor(score));
}

/**
 * Calculate element lifetime based on equation difficulty
 * @param {Object} equation - The equation object
 * @param {Object} config - Difficulty configuration  
 * @returns {number} Element lifetime in milliseconds
 */
export function calculateElementLifetime(equation, config) {
	const difficultyScore = calculateEquationDifficulty(equation, config);
	const baseTime = config.baseElementLifetime || 20000;
	
	// More difficult equations get more time
	const timeMultiplier = 1 + (difficultyScore - 1) * 0.2;
	
	return Math.floor(baseTime * timeMultiplier);
}

/**
 * Get display information for a difficulty level
 * @param {string} difficultyId - The difficulty level ID
 * @returns {Object} Display information
 */
export function getDifficultyDisplayInfo(difficultyId) {
	const config = getDifficultyConfig(difficultyId);
	const theme = getDifficultyTheme(difficultyId);
	
	return {
		...config,
		theme,
		displayName: config.name.toUpperCase(),
		healthDisplay: `${config.healthBars} HP`,
		intervalDisplay: `${config.spawnInterval / 1000}s intervals`,
		operationsDisplay: config.operations.join(', ')
	};
}