// src/lib/tabs/play/input/InputStateMachine.js

/**
 * Centralized Input State Machine
 * Manages all game input to prevent conflicts between different input sources
 */

export class InputStateMachine {
	constructor() {
		this.mode = 'desktop'; // 'desktop' | 'mobile-numpad' | 'mobile-keyboard'
		this.activeInput = '';
		this.isProcessing = false;
		this.subscribers = new Set();
		this.gameCallbacks = {
			onProcessInput: null,
			onStartGame: null,
			onPauseGame: null,
			onResumeGame: null,
			onQuitGame: null
		};
		
		// Input validation
		this.inputPattern = /^-?\d*$/; // Allow numbers and negative sign at start
		this.maxInputLength = 10;
		
		// Debouncing
		this.debounceTimeout = null;
		this.debounceDelay = 50;
		
		// State tracking
		this.lastUpdateTime = 0;
		this.inputSource = null;
	}

	/**
	 * Initialize the state machine with game callbacks
	 */
	init(callbacks) {
		this.gameCallbacks = { ...this.gameCallbacks, ...callbacks };
		this.notifySubscribers();
	}

	/**
	 * Set input mode and clear current input
	 */
	setMode(newMode, source = 'system') {
		if (!['desktop', 'mobile-numpad', 'mobile-keyboard'].includes(newMode)) {
			console.warn('Invalid input mode:', newMode);
			return;
		}

		if (this.mode !== newMode) {
			
			this.mode = newMode;
			this.activeInput = '';
			this.inputSource = null;
			this.isProcessing = false;
			
			// Clear any pending debounce
			this.clearDebounce();
			
			this.notifySubscribers();
		}
	}

	/**
	 * Update input value with validation and conflict resolution
	 */
	updateInput(value, source) {
		// Validate source is allowed for current mode
		if (!this.isValidSource(source)) {
			console.warn(`Invalid input source ${source} for mode ${this.mode}`);
			return false;
		}

		// Validate input format
		if (!this.validateInput(value)) {
			console.warn('Invalid input format:', value);
			return false;
		}

		// Prevent updates during processing
		if (this.isProcessing) {
			return false;
		}

		// Update state
		this.activeInput = value;
		this.inputSource = source;
		this.lastUpdateTime = Date.now();
		
		// Debounced notification to prevent excessive updates
		this.debouncedNotify();
		
		return true;
	}

	/**
	 * Add character to input (for numpad/keyboard input)
	 */
	addChar(char, source) {
		const currentInput = this.activeInput;
		let newInput = currentInput;

		switch (char) {
			case 'backspace':
				newInput = currentInput.slice(0, -1);
				break;
			case '-':
				// Only allow minus at the beginning
				if (currentInput === '') {
					newInput = '-';
				}
				break;
			default:
				// Only allow digits
				if (/^\d$/.test(char) && currentInput.length < this.maxInputLength) {
					newInput = currentInput + char;
				}
				break;
		}

		return this.updateInput(newInput, source);
	}

	/**
	 * Process current input
	 */
	processInput() {
		if (this.isProcessing || !this.activeInput.trim()) {
			return false;
		}

		const inputValue = this.activeInput.trim();
		const answer = parseInt(inputValue);
		
		if (isNaN(answer)) {
			console.warn('Cannot process non-numeric input:', inputValue);
			return false;
		}

		this.isProcessing = true;
		
		// Call game callback
		if (this.gameCallbacks.onProcessInput) {
			try {
				const result = this.gameCallbacks.onProcessInput(inputValue);
				
				// Clear input after successful processing
				setTimeout(() => {
					this.activeInput = '';
					this.isProcessing = false;
					this.inputSource = null;
					this.notifySubscribers();
				}, 100);
				
				return result;
			} catch (error) {
				console.error('Error processing input:', error);
				this.isProcessing = false;
				this.notifySubscribers();
				return false;
			}
		}

		this.isProcessing = false;
		return false;
	}

	/**
	 * Handle game control actions
	 */
	handleGameAction(action, context = {}) {
		const { gameState, isGamePaused, difficulty } = context;

		switch (action) {
			case 'start':
				if (difficulty && difficulty !== 'Null' && this.gameCallbacks.onStartGame) {
					return this.gameCallbacks.onStartGame();
				}
				break;

			case 'pause':
				if (!isGamePaused && this.gameCallbacks.onPauseGame) {
					return this.gameCallbacks.onPauseGame();
				}
				break;

			case 'resume':
				if (isGamePaused && this.gameCallbacks.onResumeGame) {
					return this.gameCallbacks.onResumeGame();
				}
				break;

			case 'quit':
				if (this.gameCallbacks.onQuitGame) {
					return this.gameCallbacks.onQuitGame();
				}
				break;

			case 'toggle-pause':
				if (isGamePaused) {
					return this.handleGameAction('resume', context);
				} else {
					return this.handleGameAction('pause', context);
				}
				break;

			default:
				console.warn('Unknown game action:', action);
				return false;
		}

		return false;
	}

	/**
	 * Validate input source for current mode
	 */
	isValidSource(source) {
		const validSources = {
			'desktop': ['keyboard'],
			'mobile-numpad': ['numpad'],
			'mobile-keyboard': ['mobile-input', 'device-keyboard']
		};

		return validSources[this.mode]?.includes(source) || false;
	}

	/**
	 * Validate input format
	 */
	validateInput(value) {
		if (typeof value !== 'string') return false;
		if (value.length > this.maxInputLength) return false;
		return this.inputPattern.test(value);
	}

	/**
	 * Get current state for components
	 */
	getState() {
		return {
			mode: this.mode,
			input: this.activeInput,
			isProcessing: this.isProcessing,
			inputSource: this.inputSource,
			lastUpdateTime: this.lastUpdateTime,
			hasInput: this.activeInput.length > 0,
			canProcess: this.activeInput.trim().length > 0 && !this.isProcessing
		};
	}

	/**
	 * Subscribe to state changes
	 */
	subscribe(callback) {
		if (typeof callback !== 'function') {
			throw new Error('Callback must be a function');
		}

		this.subscribers.add(callback);
		
		// Immediately call with current state
		callback(this.getState());
		
		// Return unsubscribe function
		return () => {
			this.subscribers.delete(callback);
		};
	}

	/**
	 * Notify all subscribers of state changes
	 */
	notifySubscribers() {
		const state = this.getState();
		this.subscribers.forEach(callback => {
			try {
				callback(state);
			} catch (error) {
				console.error('Error in input state subscriber:', error);
			}
		});
	}

	/**
	 * Debounced notification to prevent excessive updates
	 */
	debouncedNotify() {
		this.clearDebounce();
		this.debounceTimeout = setTimeout(() => {
			this.notifySubscribers();
		}, this.debounceDelay);
	}

	/**
	 * Clear debounce timeout
	 */
	clearDebounce() {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = null;
		}
	}

	/**
	 * Reset to initial state
	 */
	reset() {
		this.activeInput = '';
		this.isProcessing = false;
		this.inputSource = null;
		this.lastUpdateTime = 0;
		this.clearDebounce();
		this.notifySubscribers();
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.clearDebounce();
		this.subscribers.clear();
		this.gameCallbacks = {};
		this.activeInput = '';
		this.isProcessing = false;
		this.inputSource = null;
	}

	/**
	 * Get debug information
	 */
	getDebugInfo() {
		return {
			mode: this.mode,
			input: this.activeInput,
			inputLength: this.activeInput.length,
			isProcessing: this.isProcessing,
			inputSource: this.inputSource,
			subscriberCount: this.subscribers.size,
			lastUpdateTime: this.lastUpdateTime,
			hasDebounce: !!this.debounceTimeout
		};
	}
}

// Create singleton instance
export const inputStateMachine = new InputStateMachine();

// Debug access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
	window.__inputStateMachine = inputStateMachine;
}