<!-- src/lib/tabs/play/ui/GameField.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { viewport } from '../layout/viewportStore';

	// Props
	export let elements = [];
	export let onFieldReady = () => {};

	// Field state
	let fieldContainer;
	let fieldDimensions = { width: 800, height: 600 };
	let safeSpawnArea = null;

	// Element dimensions
	const ELEMENT_WIDTH = $viewport.isMobile ? 100 : 120;
	const ELEMENT_HEIGHT = $viewport.isMobile ? 70 : 80;
	const ELEMENT_MARGIN = 20;

	// Update field dimensions when container changes
	function updateFieldDimensions() {
		if (!fieldContainer) return;

		const rect = fieldContainer.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return; // Skip invalid dimensions

		// Use 45vh on mobile (numpad takes 55vh), full height on desktop
		const effectiveHeight = $viewport.isMobile ? window.innerHeight * 0.45 : rect.height;

		fieldDimensions = {
			width: rect.width,
			height: effectiveHeight
		};

		// Calculate safe spawn area (keep elements fully within bounds)
		const marginX = ELEMENT_MARGIN;
		const marginY = ELEMENT_MARGIN;

		safeSpawnArea = {
			width: Math.max(0, fieldDimensions.width - ELEMENT_WIDTH - marginX * 2),
			height: Math.max(0, effectiveHeight - ELEMENT_HEIGHT - marginY * 2),
			offsetX: marginX,
			offsetY: marginY
		};

		// Notify parent of field readiness
		if (safeSpawnArea.width > 0 && safeSpawnArea.height > 0) {
			onFieldReady({
				containerWidth: fieldDimensions.width,
				containerHeight: effectiveHeight,
				safeArea: safeSpawnArea
			});
		}
	}

	// Ensure element is within bounds
	function getConstrainedPosition(element) {
		if (!safeSpawnArea) return { x: 0, y: 0 };

		const x = Math.max(
			safeSpawnArea.offsetX,
			Math.min(element.x, safeSpawnArea.offsetX + safeSpawnArea.width)
		);
		const y = Math.max(
			safeSpawnArea.offsetY,
			Math.min(element.y, safeSpawnArea.offsetY + safeSpawnArea.height)
		);

		return { x, y };
	}

	function getDifficultyClass(equation) {
		const difficulty = equation?.difficulty || 1;
		if (difficulty >= 4) return 'difficulty-extreme';
		if (difficulty >= 3) return 'difficulty-hard';
		if (difficulty >= 2) return 'difficulty-medium';
		return 'difficulty-easy';
	}

	function getElementStyle(element) {
		const pos = getConstrainedPosition(element);
		// Use CSS custom property for progress animation
		return `
			left: ${pos.x}px; 
			top: ${pos.y}px;
			--progress: ${element.progress || 100};
		`;
	}

	function getProgressColor(progress, isGolden) {
		if (isGolden) {
			if (progress < 20) return '#ff6b6b';
			if (progress < 50) return '#ffd93d';
			return '#ffd700';
		}

		if (progress < 20) return '#ff4444';
		if (progress < 50) return '#ff9f00';
		return '#4caf50';
	}

	// Handle resize events
	let resizeObserver;
	let resizeTimeout;

	function handleResize() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(updateFieldDimensions, 100);
	}

	onMount(() => {
		// Initial dimension update
		updateFieldDimensions();

		// Set up resize observer
		if (fieldContainer && window.ResizeObserver) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(fieldContainer);
		}

		// Fallback for browsers without ResizeObserver
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
		clearTimeout(resizeTimeout);
	});

	// Update dimensions when viewport changes
	$: if ($viewport.width || $viewport.height) {
		updateFieldDimensions();
	}
</script>

<div
	bind:this={fieldContainer}
	class="game-field"
	class:mobile={$viewport.isMobile}
	role="main"
	aria-label="Game field with math equations"
>
	<!-- Equations Container -->
	<div class="equations-container">
		{#each elements as element (element.id)}
			<div
				class="equation-element {getDifficultyClass(element.equation)}"
				class:golden={element.isGolden}
				class:correct={element.state === 'correct'}
				class:missed={element.state === 'missed'}
				class:expiring={element.isExpiring || element.progress < 20}
				style={getElementStyle(element)}
				in:scale={{ duration: 300, start: 0.8 }}
				out:fly={{ duration: 300, y: 50, opacity: 0 }}
			>
				<!-- Equation Content -->
				<div class="equation-content">
					<div class="equation-text">
						{element.equation.displayText}
					</div>

					{#if element.isGolden}
						<div class="golden-indicator" title="Bonus health!">💎</div>
					{/if}
				</div>

				<!-- Progress Bar -->
				<div class="progress-container">
					<div
						class="progress-bar"
						class:expiring={element.isExpiring || element.progress < 20}
						style="
							width: calc(var(--progress) * 1%);
							background-color: {getProgressColor(element.progress, element.isGolden)};
						"
					></div>
				</div>

				<!-- Visual Effects -->
				{#if element.state === 'correct'}
					<div class="success-effect" in:scale={{ duration: 200 }}>✓</div>
				{:else if element.state === 'missed'}
					<div class="miss-effect" in:scale={{ duration: 200 }}>✗</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.game-field {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #000;
		overflow: hidden;
		user-select: none;
	}

	.equations-container {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	/* Equation Elements */
	.equation-element {
		position: absolute;
		width: 120px;
		height: 80px;
		background: rgba(20, 20, 20, 0.9);
		border: 2px solid #333;
		border-radius: 8px;
		color: white;
		display: flex;
		flex-direction: column;
		padding: 8px;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		overflow: hidden;
	}

	.game-field.mobile .equation-element {
		width: 100px;
		height: 70px;
		padding: 6px;
		border-radius: 6px;
	}

	.equation-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.equation-text {
		font-family: 'Courier New', monospace;
		font-weight: 700;
		font-size: 16px;
		text-align: center;
		line-height: 1.2;
		word-break: break-all;
	}

	.game-field.mobile .equation-text {
		font-size: 14px;
	}

	.golden-indicator {
		position: absolute;
		top: -6px;
		right: -6px;
		font-size: 16px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
		animation: sparkle 2s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
		}
		50% {
			transform: scale(1.1) rotate(10deg);
		}
	}

	.progress-container {
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
		margin-top: 4px;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		border-radius: 2px;
		transition:
			width 0.1s linear,
			background-color 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	/* Progress bar shimmer effect */
	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		animation: shimmer 2s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	.progress-bar.expiring {
		animation: pulse-warning 0.6s ease-in-out infinite;
	}

	@keyframes pulse-warning {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	/* Difficulty Styles */
	.equation-element.difficulty-medium {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
	}

	.equation-element.difficulty-hard {
		border-color: #8b5cf6;
		background: rgba(139, 92, 246, 0.1);
	}

	.equation-element.difficulty-extreme {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	/* Golden Element */
	.equation-element.golden {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 237, 78, 0.2));
		border-color: #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
	}

	.equation-element.golden .equation-text {
		color: #ffd700;
		text-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
	}

	.equation-element.golden .progress-container {
		background: rgba(255, 215, 0, 0.1);
	}

	/* State Effects */
	.equation-element.correct {
		background: rgba(76, 175, 80, 0.3);
		border-color: #4caf50;
		transform: scale(1.05);
		z-index: 10;
	}

	.equation-element.missed {
		background: rgba(244, 67, 54, 0.3);
		border-color: #f44336;
		transform: scale(0.95);
		z-index: 10;
	}

	.equation-element.expiring {
		border-color: #ff4444;
		box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
	}

	/* Success/Miss Effects */
	.success-effect,
	.miss-effect {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2rem;
		font-weight: bold;
		z-index: 20;
		pointer-events: none;
	}

	.success-effect {
		color: #4caf50;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.miss-effect {
		color: #f44336;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.equation-element {
			border-width: 3px;
			font-weight: 900;
		}

		.progress-container {
			border: 1px solid #fff;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.equation-element {
			transition: none;
		}

		.progress-bar {
			transition: width 0.1s linear;
		}

		.progress-bar::after {
			display: none;
		}

		.progress-bar.expiring,
		.equation-element.expiring,
		.golden-indicator {
			animation: none;
		}
	}
</style>
