<!-- src/lib/Tabs/Play/CustomDifficultyPanel.svelte -->
<script>
	import { fade, slide } from 'svelte/transition';

	export let onClose;
	export let onApply;

	let config = {
		healthBars: 3,
		spawnInterval: 30000,
		initialElements: 4,
		operations: ['+', '-', '*'],
		numberRanges: { min: 1, max: 50 },
		complexityWeight: 1.2,
		goldenChance: 0.15
	};

	const availableOperations = [
		{ id: '+', label: 'Addition', description: 'Simple addition problems' },
		{ id: '-', label: 'Subtraction', description: 'Basic subtraction' },
		{ id: '*', label: 'Multiplication', description: 'Times tables and beyond' },
		{ id: '/', label: 'Division', description: 'Clean division problems' },
		{ id: '%', label: 'Modulo', description: 'Remainder operations' },
		{ id: '^', label: 'Exponents', description: 'Power calculations' },
		{ id: 'sqrt', label: 'Square Root', description: 'Perfect square roots' },
		{ id: 'multi', label: 'Multi-step', description: 'Complex expressions' }
	];

	let previewStats = '';

	$: updatePreview(config);

	function updatePreview(cfg) {
		const difficulty =
			cfg.complexityWeight < 1
				? 'Casual'
				: cfg.complexityWeight < 1.5
					? 'Moderate'
					: cfg.complexityWeight < 2
						? 'Challenging'
						: 'Extreme';

		const avgTime = Math.round(cfg.spawnInterval / 1000);
		previewStats = `${difficulty} • ${cfg.healthBars} HP • ${avgTime}s intervals • ${cfg.operations.length} operations`;
	}

	function toggleOperation(opId) {
		if (config.operations.includes(opId)) {
			// Don't allow removing all operations
			if (config.operations.length > 1) {
				config.operations = config.operations.filter((op) => op !== opId);
			}
		} else {
			config.operations = [...config.operations, opId];
		}
		config = config; // Trigger reactivity
	}

	function loadPreset(preset) {
		switch (preset) {
			case 'relaxed':
				config = {
					healthBars: 7,
					spawnInterval: 60000,
					initialElements: 2,
					operations: ['+', '-'],
					numberRanges: { min: 1, max: 20 },
					complexityWeight: 0.8,
					goldenChance: 0.25
				};
				break;
			case 'intense':
				config = {
					healthBars: 1,
					spawnInterval: 15000,
					initialElements: 8,
					operations: ['+', '-', '*', '/', '%', '^', 'sqrt', 'multi'],
					numberRanges: { min: 50, max: 500 },
					complexityWeight: 2.5,
					goldenChance: 0.05
				};
				break;
			case 'balanced':
				config = {
					healthBars: 4,
					spawnInterval: 35000,
					initialElements: 3,
					operations: ['+', '-', '*', '/'],
					numberRanges: { min: 10, max: 100 },
					complexityWeight: 1.3,
					goldenChance: 0.15
				};
				break;
		}
	}

	function handleApply() {
		onApply(config);
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onClose();
		} else if (event.key === 'Enter' && event.ctrlKey) {
			handleApply();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="custom-panel" in:fade={{ duration: 300 }} role="dialog" aria-labelledby="custom-title">
	<div class="panel-content" in:slide={{ duration: 400 }}>
		<div class="panel-header">
			<h2 id="custom-title">Custom Difficulty</h2>
			<button class="close-btn" on:click={onClose} aria-label="Close custom difficulty panel">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>
		</div>

		<div class="panel-body">
			<!-- Quick Presets -->
			<section class="presets-section" aria-labelledby="presets-title">
				<h3 id="presets-title">Quick Presets</h3>
				<div class="preset-buttons">
					<button class="preset-btn relaxed" on:click={() => loadPreset('relaxed')}>
						Relaxed
					</button>
					<button class="preset-btn balanced" on:click={() => loadPreset('balanced')}>
						Balanced
					</button>
					<button class="preset-btn intense" on:click={() => loadPreset('intense')}>
						Intense
					</button>
				</div>
			</section>

			<div class="config-grid">
				<!-- Basic Settings -->
				<section class="config-section" aria-labelledby="basic-title">
					<h3 id="basic-title">Basic Settings</h3>

					<div class="input-group">
						<label for="health-bars">Health Points</label>
						<input
							id="health-bars"
							type="range"
							min="1"
							max="10"
							bind:value={config.healthBars}
							aria-describedby="health-desc"
						/>
						<span class="input-value">{config.healthBars}</span>
						<div id="health-desc" class="input-description">Lives before game over</div>
					</div>

					<div class="input-group">
						<label for="spawn-interval">Spawn Interval (seconds)</label>
						<input
							id="spawn-interval"
							type="range"
							min="10"
							max="120"
							step="5"
							bind:value={config.spawnInterval}
							on:input={(e) => (config.spawnInterval = parseInt(e.target.value) * 1000)}
							aria-describedby="spawn-desc"
						/>
						<span class="input-value">{config.spawnInterval / 1000}s</span>
						<div id="spawn-desc" class="input-description">Time between new equations</div>
					</div>

					<div class="input-group">
						<label for="initial-elements">Starting Equations</label>
						<input
							id="initial-elements"
							type="range"
							min="1"
							max="10"
							bind:value={config.initialElements}
							aria-describedby="initial-desc"
						/>
						<span class="input-value">{config.initialElements}</span>
						<div id="initial-desc" class="input-description">Equations on screen at start</div>
					</div>
				</section>

				<!-- Number Ranges -->
				<section class="config-section" aria-labelledby="numbers-title">
					<h3 id="numbers-title">Number Ranges</h3>

					<div class="input-group">
						<label for="min-number">Minimum Number</label>
						<input
							id="min-number"
							type="number"
							min="1"
							max="100"
							bind:value={config.numberRanges.min}
							aria-describedby="min-desc"
						/>
						<div id="min-desc" class="input-description">Smallest number in equations</div>
					</div>

					<div class="input-group">
						<label for="max-number">Maximum Number</label>
						<input
							id="max-number"
							type="number"
							min="10"
							max="1000"
							bind:value={config.numberRanges.max}
							aria-describedby="max-desc"
						/>
						<div id="max-desc" class="input-description">Largest number in equations</div>
					</div>
				</section>
			</div>

			<!-- Operations -->
			<section class="operations-section" aria-labelledby="ops-title">
				<h3 id="ops-title">Available Operations</h3>
				<div class="operations-grid" role="group" aria-labelledby="ops-title">
					{#each availableOperations as op}
						<button
							class="operation-toggle"
							class:active={config.operations.includes(op.id)}
							class:disabled={config.operations.length === 1 && config.operations.includes(op.id)}
							on:click={() => toggleOperation(op.id)}
							role="checkbox"
							aria-checked={config.operations.includes(op.id)}
							aria-describedby="op-{op.id}-desc"
							title={op.description}
						>
							<span class="op-symbol">{op.id === 'multi' ? '()' : op.id}</span>
							<span class="op-label">{op.label}</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Advanced -->
			<section class="config-section advanced" aria-labelledby="advanced-title">
				<h3 id="advanced-title">Advanced</h3>

				<div class="input-group">
					<label for="complexity">Complexity Multiplier</label>
					<input
						id="complexity"
						type="range"
						min="0.5"
						max="3"
						step="0.1"
						bind:value={config.complexityWeight}
						aria-describedby="complexity-desc"
					/>
					<span class="input-value">{config.complexityWeight}x</span>
					<div id="complexity-desc" class="input-description">Affects equation solving time</div>
				</div>

				<div class="input-group">
					<label for="golden-chance">Golden Equation Chance</label>
					<input
						id="golden-chance"
						type="range"
						min="0"
						max="0.5"
						step="0.05"
						bind:value={config.goldenChance}
						aria-describedby="golden-desc"
					/>
					<span class="input-value">{Math.round(config.goldenChance * 100)}%</span>
					<div id="golden-desc" class="input-description">Health-giving golden equations</div>
				</div>
			</section>

			<!-- Preview -->
			<div class="preview-section">
				<h3>Preview</h3>
				<div class="preview-stats">{previewStats}</div>
			</div>
		</div>

		<div class="panel-footer">
			<button class="cancel-btn" on:click={onClose}>
				Cancel <kbd>Esc</kbd>
			</button>
			<button class="apply-btn" on:click={handleApply}>
				Apply & Start <kbd>Ctrl+Enter</kbd>
			</button>
		</div>
	</div>
</div>

<style>
	.custom-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 110;
		backdrop-filter: blur(10px);
		overflow-y: auto;
		padding: 1rem;
	}

	.panel-content {
		background: #111;
		border: 2px solid #333;
		border-radius: 20px;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #333;
	}

	.panel-header h2 {
		font-size: 1.8rem;
		color: #fff;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		color: #999;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #333;
		color: #fff;
	}

	.panel-body {
		padding: 2rem;
	}

	.presets-section {
		margin-bottom: 2rem;
	}

	.presets-section h3 {
		color: #fff;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.preset-buttons {
		display: flex;
		gap: 1rem;
	}

	.preset-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid #333;
		background: transparent;
		color: #ccc;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		font-weight: 500;
	}

	.preset-btn.relaxed:hover {
		border-color: #10b981;
		color: #10b981;
	}
	.preset-btn.balanced:hover {
		border-color: #f59e0b;
		color: #f59e0b;
	}
	.preset-btn.intense:hover {
		border-color: #ef4444;
		color: #ef4444;
	}

	.config-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.config-section {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #333;
		border-radius: 12px;
		padding: 1.5rem;
	}

	.config-section h3 {
		color: #fff;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
		border-bottom: 1px solid #333;
		padding-bottom: 0.5rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	.input-group label {
		display: block;
		color: #e0e0e0;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.input-group input[type='range'] {
		width: 100%;
		margin-bottom: 0.25rem;
	}

	.input-group input[type='number'] {
		width: 100%;
		padding: 0.5rem;
		background: #222;
		border: 1px solid #444;
		border-radius: 6px;
		color: #fff;
	}

	.input-value {
		color: #999;
		font-family: 'Courier New', monospace;
		font-weight: 600;
	}

	.input-description {
		color: #666;
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}

	.operations-section {
		margin-bottom: 2rem;
	}

	.operations-section h3 {
		color: #fff;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.operations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.operation-toggle {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.02);
		border: 2px solid #333;
		border-radius: 8px;
		color: #ccc;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.operation-toggle.active {
		border-color: #8b5cf6;
		background: rgba(139, 92, 246, 0.1);
		color: #fff;
	}

	.operation-toggle.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.operation-toggle:not(.disabled):hover {
		border-color: #555;
		background: rgba(255, 255, 255, 0.05);
	}

	.op-symbol {
		font-family: 'Courier New', monospace;
		font-weight: bold;
		font-size: 1.1rem;
		min-width: 20px;
		text-align: center;
	}

	.advanced {
		grid-column: span 2;
	}

	.preview-section {
		background: rgba(139, 92, 246, 0.1);
		border: 1px solid #8b5cf6;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.preview-section h3 {
		color: #8b5cf6;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}

	.preview-stats {
		color: #e0e0e0;
		font-family: 'Courier New', monospace;
		font-size: 1rem;
	}

	.panel-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-top: 1px solid #333;
		background: rgba(255, 255, 255, 0.01);
	}

	.cancel-btn,
	.apply-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	.apply-btn:hover {
		background: #7c3aed;
		border-color: #7c3aed;
	}

	kbd {
		background: #333;
		border: 1px solid #555;
		border-radius: 4px;
		padding: 0.2em 0.4em;
		font-family: monospace;
		font-size: 0.8em;
	}

	@media (max-width: 768px) {
		.panel-content {
			margin: 0;
			border-radius: 0;
			max-height: 100vh;
		}

		.config-grid {
			grid-template-columns: 1fr;
		}

		.advanced {
			grid-column: span 1;
		}

		.operations-grid {
			grid-template-columns: 1fr;
		}

		.preset-buttons {
			flex-direction: column;
		}

		.panel-footer {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
