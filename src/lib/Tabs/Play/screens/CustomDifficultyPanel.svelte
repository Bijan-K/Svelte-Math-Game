<!-- src/lib/tabs/play/screens/CustomDifficultyPanel.svelte -->
<script>
	import { fade, scale, slide } from 'svelte/transition';
	import { viewport } from '../layout/viewportStore.js';

	export let onClose;
	export let onApply;

	// Custom configuration state
	let config = {
		healthBars: 3,
		spawnInterval: 30000,
		initialElements: 4,
		operations: ['+', '-', '*'],
		numberRanges: { min: 1, max: 50 },
		complexityWeight: 1.0,
		goldenChance: 0.15
	};

	// Available operations with descriptions
	const availableOperations = [
		{ id: '+', label: 'Addition (+)', description: 'Basic addition', difficulty: 1 },
		{ id: '-', label: 'Subtraction (−)', description: 'Basic subtraction', difficulty: 1 },
		{ id: '*', label: 'Multiplication (×)', description: 'Basic multiplication', difficulty: 2 },
		{ id: '/', label: 'Division (÷)', description: 'Exact division only', difficulty: 3 },
		{ id: '%', label: 'Modulo (%)', description: 'Remainder operations', difficulty: 3 },
		{ id: '^', label: 'Exponents (^)', description: 'Power operations', difficulty: 4 },
		{ id: 'sqrt', label: 'Square Root (√)', description: 'Perfect squares only', difficulty: 4 },
		{ id: 'multi', label: 'Multi-step', description: 'Complex expressions', difficulty: 5 }
	];

	// Validation state
	let errors = {};
	let hasErrors = false;

	// Reactive validation
	$: validateConfig(config);

	function validateConfig(cfg) {
		errors = {};

		if (cfg.healthBars < 1 || cfg.healthBars > 10) {
			errors.healthBars = 'Health must be between 1-10';
		}

		if (cfg.spawnInterval < 5000 || cfg.spawnInterval > 120000) {
			errors.spawnInterval = 'Interval must be between 5-120 seconds';
		}

		if (cfg.initialElements < 1 || cfg.initialElements > 10) {
			errors.initialElements = 'Initial elements must be between 1-10';
		}

		if (cfg.numberRanges.min < 1 || cfg.numberRanges.min > 999) {
			errors.minRange = 'Min must be between 1-999';
		}

		if (cfg.numberRanges.max < cfg.numberRanges.min || cfg.numberRanges.max > 9999) {
			errors.maxRange = 'Max must be greater than min and ≤ 9999';
		}

		if (cfg.operations.length === 0) {
			errors.operations = 'Select at least one operation';
		}

		hasErrors = Object.keys(errors).length > 0;
	}

	function toggleOperation(opId) {
		const index = config.operations.indexOf(opId);
		if (index > -1) {
			// Remove operation
			config.operations = config.operations.filter((op) => op !== opId);
		} else {
			// Add operation
			config.operations = [...config.operations, opId];
		}
		config = { ...config }; // Trigger reactivity
	}

	function handlePreset(presetName) {
		switch (presetName) {
			case 'casual':
				config = {
					healthBars: 5,
					spawnInterval: 40000,
					initialElements: 3,
					operations: ['+', '-'],
					numberRanges: { min: 1, max: 20 },
					complexityWeight: 0.8,
					goldenChance: 0.2
				};
				break;
			case 'standard':
				config = {
					healthBars: 3,
					spawnInterval: 30000,
					initialElements: 4,
					operations: ['+', '-', '*', '/'],
					numberRanges: { min: 5, max: 100 },
					complexityWeight: 1.2,
					goldenChance: 0.15
				};
				break;
			case 'hardcore':
				config = {
					healthBars: 1,
					spawnInterval: 20000,
					initialElements: 6,
					operations: ['+', '-', '*', '/', '%', '^', 'sqrt'],
					numberRanges: { min: 10, max: 500 },
					complexityWeight: 2.0,
					goldenChance: 0.1
				};
				break;
			case 'zen':
				config = {
					healthBars: 10,
					spawnInterval: 60000,
					initialElements: 2,
					operations: ['+', '-'],
					numberRanges: { min: 1, max: 10 },
					complexityWeight: 0.5,
					goldenChance: 0.3
				};
				break;
		}
	}

	function handleApply() {
		if (!hasErrors) {
			onApply(config);
		}
	}

	function handleClose() {
		onClose();
	}

	// Keyboard shortcuts
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
		} else if (event.key === 'Enter' && !hasErrors) {
			event.preventDefault();
			handleApply();
		}
	}

	// Calculate estimated difficulty
	$: estimatedDifficulty = calculateDifficulty(config);

	function calculateDifficulty(cfg) {
		let difficulty = 0;

		// Health penalty
		difficulty += (6 - cfg.healthBars) * 0.5;

		// Spawn speed penalty
		difficulty += (45000 - cfg.spawnInterval) / 10000;

		// Initial elements penalty
		difficulty += (cfg.initialElements - 3) * 0.3;

		// Operation complexity
		const opWeights = { '+': 0, '-': 0, '*': 1, '/': 2, '%': 2, '^': 3, sqrt: 3, multi: 4 };
		const avgOpWeight =
			cfg.operations.reduce((sum, op) => sum + (opWeights[op] || 0), 0) / cfg.operations.length;
		difficulty += avgOpWeight;

		// Number range penalty
		const rangeComplexity = (cfg.numberRanges.max - cfg.numberRanges.min) / 100;
		difficulty += rangeComplexity;

		// Complexity weight
		difficulty *= cfg.complexityWeight;

		return Math.max(0, Math.min(10, difficulty));
	}

	function getDifficultyLabel(score) {
		if (score < 2) return { label: 'Very Easy', color: '#10b981' };
		if (score < 4) return { label: 'Easy', color: '#22c55e' };
		if (score < 6) return { label: 'Medium', color: '#f59e0b' };
		if (score < 8) return { label: 'Hard', color: '#ef4444' };
		return { label: 'Extreme', color: '#dc2626' };
	}

	$: difficultyInfo = getDifficultyLabel(estimatedDifficulty);
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="custom-panel"
	class:mobile={$viewport.isMobile}
	role="dialog"
	aria-labelledby="custom-title"
	aria-modal="true"
	in:fade={{ duration: 300 }}
>
	<div class="panel-container" in:scale={{ duration: 400, start: 0.9 }}>
		<!-- Header -->
		<header class="panel-header">
			<h1 id="custom-title">Custom Difficulty</h1>
			<button
				class="close-btn"
				on:click={handleClose}
				aria-label="Close panel"
				title="Close (Escape)"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>
		</header>

		<!-- Content -->
		<main class="panel-content">
			<!-- Presets -->
			<section class="presets-section">
				<h2>Quick Presets</h2>
				<div class="presets-grid">
					<button class="preset-btn casual" on:click={() => handlePreset('casual')}>
						🌱 Casual
					</button>
					<button class="preset-btn standard" on:click={() => handlePreset('standard')}>
						⚖️ Standard
					</button>
					<button class="preset-btn hardcore" on:click={() => handlePreset('hardcore')}>
						🔥 Hardcore
					</button>
					<button class="preset-btn zen" on:click={() => handlePreset('zen')}> 🧘 Zen Mode </button>
				</div>
			</section>

			<!-- Configuration -->
			<section class="config-section">
				<div class="config-grid">
					<!-- Health Bars -->
					<div class="config-group">
						<label for="health-input">
							Health Bars
							<span class="field-hint">Lives before game over</span>
						</label>
						<input
							id="health-input"
							type="number"
							min="1"
							max="10"
							bind:value={config.healthBars}
							class:error={errors.healthBars}
						/>
						{#if errors.healthBars}
							<span class="error-text">{errors.healthBars}</span>
						{/if}
					</div>

					<!-- Spawn Interval -->
					<div class="config-group">
						<label for="interval-input">
							Spawn Interval (ms)
							<span class="field-hint">Time between new equations</span>
						</label>
						<input
							id="interval-input"
							type="number"
							min="5000"
							max="120000"
							step="1000"
							bind:value={config.spawnInterval}
							class:error={errors.spawnInterval}
						/>
						<span class="field-info">{(config.spawnInterval / 1000).toFixed(1)}s</span>
						{#if errors.spawnInterval}
							<span class="error-text">{errors.spawnInterval}</span>
						{/if}
					</div>

					<!-- Initial Elements -->
					<div class="config-group">
						<label for="initial-input">
							Initial Elements
							<span class="field-hint">Starting equations on field</span>
						</label>
						<input
							id="initial-input"
							type="number"
							min="1"
							max="10"
							bind:value={config.initialElements}
							class:error={errors.initialElements}
						/>
						{#if errors.initialElements}
							<span class="error-text">{errors.initialElements}</span>
						{/if}
					</div>

					<!-- Number Range -->
					<div class="config-group range-group">
						<label>
							Number Range
							<span class="field-hint">Min and max values</span>
						</label>
						<div class="range-inputs">
							<input
								type="number"
								min="1"
								max="999"
								bind:value={config.numberRanges.min}
								class:error={errors.minRange}
								placeholder="Min"
							/>
							<span class="range-separator">to</span>
							<input
								type="number"
								min="2"
								max="9999"
								bind:value={config.numberRanges.max}
								class:error={errors.maxRange}
								placeholder="Max"
							/>
						</div>
						{#if errors.minRange || errors.maxRange}
							<span class="error-text">{errors.minRange || errors.maxRange}</span>
						{/if}
					</div>

					<!-- Complexity Weight -->
					<div class="config-group">
						<label for="complexity-input">
							Complexity Weight
							<span class="field-hint">Equation difficulty multiplier</span>
						</label>
						<input
							id="complexity-input"
							type="range"
							min="0.5"
							max="3.0"
							step="0.1"
							bind:value={config.complexityWeight}
						/>
						<span class="field-info">{config.complexityWeight.toFixed(1)}x</span>
					</div>

					<!-- Golden Chance -->
					<div class="config-group">
						<label for="golden-input">
							Golden Equation Chance
							<span class="field-hint">Probability of bonus equations</span>
						</label>
						<input
							id="golden-input"
							type="range"
							min="0"
							max="0.5"
							step="0.05"
							bind:value={config.goldenChance}
						/>
						<span class="field-info">{(config.goldenChance * 100).toFixed(0)}%</span>
					</div>
				</div>
			</section>

			<!-- Operations -->
			<section class="operations-section">
				<h2>
					Operations
					{#if errors.operations}
						<span class="error-text inline">{errors.operations}</span>
					{/if}
				</h2>
				<div class="operations-grid">
					{#each availableOperations as op}
						<button
							class="operation-btn"
							class:selected={config.operations.includes(op.id)}
							class:high-difficulty={op.difficulty >= 4}
							on:click={() => toggleOperation(op.id)}
							aria-pressed={config.operations.includes(op.id)}
							title={op.description}
						>
							<div class="op-header">
								<span class="op-label">{op.label}</span>
								<span class="op-difficulty">
									{'★'.repeat(op.difficulty)}
								</span>
							</div>
							<div class="op-description">{op.description}</div>
						</button>
					{/each}
				</div>
			</section>

			<!-- Difficulty Estimate -->
			<section class="difficulty-estimate">
				<div class="difficulty-indicator" style="--difficulty-color: {difficultyInfo.color}">
					<span class="difficulty-label">Estimated Difficulty:</span>
					<span class="difficulty-value">{difficultyInfo.label}</span>
					<div class="difficulty-bar">
						<div
							class="difficulty-fill"
							style="width: {(estimatedDifficulty / 10) *
								100}%; background: {difficultyInfo.color};"
						></div>
					</div>
				</div>
			</section>
		</main>

		<!-- Footer -->
		<footer class="panel-footer">
			<div class="footer-actions">
				<button class="cancel-btn" on:click={handleClose}> Cancel </button>
				<button
					class="apply-btn"
					on:click={handleApply}
					disabled={hasErrors}
					class:disabled={hasErrors}
				>
					Apply & Start
					{#if !$viewport.isMobile}
						<kbd>Enter</kbd>
					{/if}
				</button>
			</div>
		</footer>
	</div>
</div>

<style>
	.custom-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(10px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: clamp(1rem, 4vw, 2rem);
		overflow-y: auto;
	}

	.panel-container {
		background: rgba(0, 0, 0, 0.95);
		border: 2px solid #333;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: clamp(1rem, 3vw, 1.5rem);
		border-bottom: 1px solid #333;
		background: rgba(0, 0, 0, 0.8);
	}

	#custom-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.close-btn {
		background: transparent;
		border: 2px solid #666;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		color: #ccc;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		border-color: #fff;
		color: #fff;
		transform: scale(1.05);
	}

	/* Content */
	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: clamp(1rem, 3vw, 1.5rem);
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 4vw, 2rem);
	}

	.panel-content h2 {
		font-size: clamp(1.1rem, 3vw, 1.3rem);
		color: #fff;
		margin: 0 0 clamp(0.75rem, 2vw, 1rem) 0;
		font-weight: 600;
	}

	/* Presets */
	.presets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: clamp(0.5rem, 2vw, 1rem);
	}

	.preset-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: clamp(0.75rem, 2vw, 1rem);
		color: #fff;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		font-weight: 500;
	}

	.preset-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.4);
		transform: scale(1.02);
	}

	.preset-btn.casual:hover {
		border-color: #10b981;
	}
	.preset-btn.standard:hover {
		border-color: #f59e0b;
	}
	.preset-btn.hardcore:hover {
		border-color: #ef4444;
	}
	.preset-btn.zen:hover {
		border-color: #8b5cf6;
	}

	/* Configuration */
	.config-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: clamp(1rem, 3vw, 1.5rem);
	}

	.config-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.config-group label {
		color: #ccc;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		font-weight: 500;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-hint {
		font-size: clamp(0.75rem, 2vw, 0.8rem);
		color: #999;
		font-weight: normal;
		font-style: italic;
	}

	.config-group input {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: clamp(0.5rem, 2vw, 0.75rem);
		color: #fff;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		transition: all 0.3s ease;
	}

	.config-group input:focus {
		outline: none;
		border-color: #8b5cf6;
		background: rgba(255, 255, 255, 0.15);
	}

	.config-group input.error {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.field-info {
		font-size: clamp(0.8rem, 2vw, 0.85rem);
		color: #8b5cf6;
		font-weight: 500;
		align-self: flex-start;
	}

	.error-text {
		color: #ef4444;
		font-size: clamp(0.75rem, 2vw, 0.8rem);
		font-weight: 500;
	}

	.error-text.inline {
		display: inline;
		margin-left: 0.5rem;
	}

	/* Range inputs */
	.range-group {
		grid-column: span 2;
	}

	.range-inputs {
		display: flex;
		align-items: center;
		gap: clamp(0.5rem, 2vw, 1rem);
	}

	.range-inputs input {
		flex: 1;
	}

	.range-separator {
		color: #ccc;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Operations */
	.operations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: clamp(0.75rem, 2vw, 1rem);
	}

	.operation-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: clamp(0.75rem, 2vw, 1rem);
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		color: #fff;
	}

	.operation-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.operation-btn.selected {
		background: rgba(139, 92, 246, 0.2);
		border-color: #8b5cf6;
	}

	.operation-btn.high-difficulty {
		border-color: rgba(239, 68, 68, 0.5);
	}

	.operation-btn.high-difficulty.selected {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}

	.op-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.op-label {
		font-weight: 600;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
	}

	.op-difficulty {
		color: #ffd700;
		font-size: clamp(0.8rem, 2vw, 0.9rem);
	}

	.op-description {
		color: #ccc;
		font-size: clamp(0.8rem, 2vw, 0.85rem);
		line-height: 1.3;
	}

	/* Difficulty Estimate */
	.difficulty-indicator {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: clamp(1rem, 3vw, 1.5rem);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.difficulty-label {
		color: #ccc;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		font-weight: 500;
	}

	.difficulty-value {
		color: var(--difficulty-color);
		font-size: clamp(1.1rem, 3vw, 1.3rem);
		font-weight: 700;
	}

	.difficulty-bar {
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
	}

	.difficulty-fill {
		height: 100%;
		transition: all 0.3s ease;
		border-radius: 4px;
	}

	/* Footer */
	.panel-footer {
		padding: clamp(1rem, 3vw, 1.5rem);
		border-top: 1px solid #333;
		background: rgba(0, 0, 0, 0.8);
	}

	.footer-actions {
		display: flex;
		gap: clamp(0.75rem, 2vw, 1rem);
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.cancel-btn,
	.apply-btn {
		padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
		border-radius: 8px;
		font-size: clamp(0.9rem, 2.5vw, 1rem);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: clamp(100px, 20vw, 120px);
		justify-content: center;
	}

	.cancel-btn {
		background: transparent;
		border: 2px solid #666;
		color: #ccc;
	}

	.cancel-btn:hover {
		border-color: #999;
		color: #fff;
	}

	.apply-btn {
		background: #8b5cf6;
		border: 2px solid #8b5cf6;
		color: #fff;
	}

	.apply-btn:hover:not(.disabled) {
		background: #7c3aed;
		border-color: #7c3aed;
		transform: scale(1.02);
	}

	.apply-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #666;
		border-color: #666;
	}

	.apply-btn kbd {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.8em;
	}

	/* Mobile Adjustments */
	.custom-panel.mobile .config-grid {
		grid-template-columns: 1fr;
	}

	.custom-panel.mobile .range-group {
		grid-column: span 1;
	}

	.custom-panel.mobile .operations-grid {
		grid-template-columns: 1fr;
	}

	.custom-panel.mobile .footer-actions {
		justify-content: stretch;
	}

	.custom-panel.mobile .cancel-btn,
	.custom-panel.mobile .apply-btn {
		flex: 1;
		min-width: unset;
	}

	/* Landscape Mobile */
	@media (max-height: 600px) and (orientation: landscape) {
		.panel-container {
			max-height: 95vh;
		}

		.panel-content {
			gap: clamp(1rem, 3vw, 1.5rem);
		}

		.config-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.panel-container {
			border-color: #fff;
			background: #000;
		}

		.operation-btn,
		.preset-btn,
		.config-group input {
			border-color: #fff;
			background: #000;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.preset-btn,
		.operation-btn,
		.cancel-btn,
		.apply-btn,
		.close-btn {
			transition: none;
		}

		.preset-btn:hover,
		.apply-btn:hover {
			transform: none;
		}
	}

	/* Remove spinner arrows from number inputs */
	input[type='number']::-webkit-outer-spin-button,
	input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
