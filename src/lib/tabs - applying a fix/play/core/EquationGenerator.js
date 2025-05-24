// src/lib/tabs/play/core/EquationGenerator.js

/**
 * Pure equation generation logic for the math game
 * Handles all mathematical operations and equation creation
 */

/**
 * Generate a random equation based on difficulty configuration
 * @param {Object} config - Difficulty configuration object
 * @returns {Object} Generated equation object
 */
export function generateEquation(config) {
	const operations = config.operations || ['+', '-', '*'];
	const operation = operations[Math.floor(Math.random() * operations.length)];
	
	return createEquationByOperation(operation, config);
}

/**
 * Create an equation for a specific operation
 * @param {string} operation - The mathematical operation
 * @param {Object} config - Difficulty configuration object
 * @returns {Object} Generated equation object
 */
function createEquationByOperation(operation, config) {
	const { min, max } = config.numberRanges;
	
	switch (operation) {
		case '+':
			return generateAddition(min, max);
		case '-':
			return generateSubtraction(min, max);
		case '*':
			return generateMultiplication(min, max, config);
		case '/':
			return generateDivision(min, max, config);
		case '%':
			return generateModulo(min, max);
		case '^':
			return generateExponentiation(min, max);
		case 'sqrt':
			return generateSquareRoot(min, max);
		case 'multi':
			return generateMultiStep(min, max);
		default:
			return generateAddition(min, max);
	}
}

/**
 * Generate addition equation
 */
function generateAddition(min, max) {
	const a = randomInt(min, max);
	const b = randomInt(min, max);
	const answer = a + b;
	
	return {
		a,
		b,
		operation: '+',
		answer,
		displayText: `${a} + ${b}`,
		difficulty: 1
	};
}

/**
 * Generate subtraction equation (ensures positive result)
 */
function generateSubtraction(min, max) {
	const a = randomInt(min + 20, max + 20); // Ensure larger first number
	const b = randomInt(min, Math.min(a - 1, max));
	const answer = a - b;
	
	return {
		a,
		b,
		operation: '-',
		answer,
		displayText: `${a} - ${b}`,
		difficulty: 1
	};
}

/**
 * Generate multiplication equation
 */
function generateMultiplication(min, max, config) {
	// Adjust factors based on difficulty
	let maxFactor;
	if (config.id === 'ez') {
		maxFactor = 12;
	} else if (config.id === 'mid') {
		maxFactor = 25;
	} else {
		maxFactor = Math.min(50, max);
	}
	
	const a = randomInt(2, maxFactor);
	const b = randomInt(2, maxFactor);
	const answer = a * b;
	
	return {
		a,
		b,
		operation: '*',
		answer,
		displayText: `${a} × ${b}`,
		difficulty: 2
	};
}

/**
 * Generate division equation (ensures clean division)
 */
function generateDivision(min, max, config) {
	// Common divisors for clean results
	const divisors = config.id === 'mid' 
		? [2, 3, 4, 5, 6, 8, 9, 10, 12, 15]
		: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 25];
	
	const b = divisors[Math.floor(Math.random() * divisors.length)];
	const answer = randomInt(2, 20);
	const a = b * answer;
	
	return {
		a,
		b,
		operation: '/',
		answer,
		displayText: `${a} ÷ ${b}`,
		difficulty: 3
	};
}

/**
 * Generate modulo (remainder) equation
 */
function generateModulo(min, max) {
	const a = randomInt(50, 100);
	const b = randomInt(3, 20);
	const answer = a % b;
	
	return {
		a,
		b,
		operation: '%',
		answer,
		displayText: `${a} % ${b}`,
		difficulty: 3
	};
}

/**
 * Generate exponentiation equation
 */
function generateExponentiation(min, max) {
	const a = randomInt(2, 12);
	const b = randomInt(2, 4); // Keep exponents small
	const answer = Math.pow(a, b);
	
	return {
		a,
		b,
		operation: '^',
		answer,
		displayText: `${a}^${b}`,
		difficulty: 4
	};
}

/**
 * Generate square root equation (perfect squares only)
 */
function generateSquareRoot(min, max) {
	const perfectSquares = [
		4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400
	];
	
	const a = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
	const answer = Math.sqrt(a);
	
	return {
		a,
		b: null,
		operation: 'sqrt',
		answer,
		displayText: `√${a}`,
		difficulty: 4
	};
}

/**
 * Generate multi-step equation
 */
function generateMultiStep(min, max) {
	// Generate (a + b) × c format
	const step1_a = randomInt(5, 20);
	const step1_b = randomInt(2, 10);
	const step2_c = randomInt(3, 15);
	
	const intermediate = step1_a + step1_b;
	const answer = intermediate * step2_c;
	
	return {
		a: step1_a,
		b: step1_b,
		c: step2_c,
		operation: 'multi',
		answer,
		displayText: `(${step1_a}+${step1_b})×${step2_c}`,
		difficulty: 5
	};
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Validate an equation answer
 * @param {Object} equation - The equation object
 * @param {number} userAnswer - User's answer
 * @returns {boolean} True if answer is correct
 */
export function validateAnswer(equation, userAnswer) {
	return Math.round(equation.answer) === Math.round(userAnswer);
}

/**
 * Get difficulty level of an equation
 * @param {Object} equation - The equation object
 * @returns {number} Difficulty level (1-5)
 */
export function getEquationDifficultyLevel(equation) {
	return equation.difficulty || 1;
}

/**
 * Format equation for display
 * @param {Object} equation - The equation object
 * @returns {string} Formatted equation string
 */
export function formatEquationDisplay(equation) {
	if (equation.displayText) {
		return equation.displayText;
	}
	
	// Fallback formatting
	switch (equation.operation) {
		case '+':
			return `${equation.a} + ${equation.b}`;
		case '-':
			return `${equation.a} - ${equation.b}`;
		case '*':
			return `${equation.a} × ${equation.b}`;
		case '/':
			return `${equation.a} ÷ ${equation.b}`;
		case '%':
			return `${equation.a} % ${equation.b}`;
		case '^':
			return `${equation.a}^${equation.b}`;
		case 'sqrt':
			return `√${equation.a}`;
		case 'multi':
			return equation.displayText || `${equation.a} + ${equation.b} × ${equation.c}`;
		default:
			return `${equation.a} ${equation.operation} ${equation.b}`;
	}
}

/**
 * Generate a batch of equations
 * @param {number} count - Number of equations to generate
 * @param {Object} config - Difficulty configuration
 * @returns {Array} Array of equation objects
 */
export function generateEquationBatch(count, config) {
	const equations = [];
	
	for (let i = 0; i < count; i++) {
		equations.push(generateEquation(config));
	}
	
	return equations;
}

/**
 * Get operation symbol for display
 * @param {string} operation - The operation string
 * @returns {string} Display symbol
 */
export function getOperationSymbol(operation) {
	const symbols = {
		'+': '+',
		'-': '-',
		'*': '×',
		'/': '÷',
		'%': '%',
		'^': '^',
		'sqrt': '√',
		'multi': '()'
	};
	
	return symbols[operation] || operation;
}

/**
 * Get operation name for display
 * @param {string} operation - The operation string
 * @returns {string} Display name
 */
export function getOperationName(operation) {
	const names = {
		'+': 'Addition',
		'-': 'Subtraction',
		'*': 'Multiplication',
		'/': 'Division',
		'%': 'Modulo',
		'^': 'Exponentiation',
		'sqrt': 'Square Root',
		'multi': 'Multi-step'
	};
	
	return names[operation] || operation;
}

/**
 * Check if an operation is available in a difficulty level
 * @param {string} operation - The operation to check
 * @param {Object} config - Difficulty configuration
 * @returns {boolean} True if operation is available
 */
export function isOperationAvailable(operation, config) {
	return config.operations && config.operations.includes(operation);
}