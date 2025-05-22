<!-- src/lib/Tabs/Play/EquationField.svelte -->
<script>
	import { fade, scale } from 'svelte/transition';

	export let elements = [];
	export let onElementSpawn;

	let containerWidth = 800;
	let containerHeight = 600;

	// Notify parent when container dimensions change
	$: if (containerWidth && containerHeight) {
		onElementSpawn(containerWidth, containerHeight);
	}
</script>

<div
	class="equation-field"
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	role="main"
	aria-label="Game field with math equations"
>
	{#each elements as element (element.id)}
		<div
			class="equation-element"
			class:golden={element.isGolden}
			class:correct={element.state === 'correct'}
			class:missed={element.state === 'missed'}
			class:hard-problem={element.equation.difficulty >= 3}
			class:expiring={element.isExpiring}
			style="left: {element.x}px; top: {element.y}px;"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			animate:scale={{
				start: element.state === 'correct' ? 1.2 : element.state === 'missed' ? 0.8 : 1,
				duration: 500
			}}
			role="button"
			tabindex="-1"
			aria-label="Math equation: {element.equation.displayText}"
		>
			<div class="equation-display">
				{element.equation.displayText}
			</div>

			<div class="progress-bar" aria-hidden="true">
				<div
					class="progress"
					class:expiring={element.isExpiring}
					style="width: {element.progress}%;"
				></div>
			</div>

			{#if element.equation.difficulty >= 3}
				<div class="difficulty-indicator" aria-label="Hard problem">★</div>
			{/if}

			{#if element.isGolden}
				<div class="golden-indicator" aria-label="Golden equation - gives extra health">💎</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.equation-field {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: transparent;
	}

	.equation-element {
		position: absolute;
		width: 120px;
		height: 80px;
		background: #1a1a1a;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		border-radius: 8px;
		border: 2px solid #333;
		color: white;
		font-size: 15px;
		padding: 8px;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.equation-display {
		width: 100%;
		text-align: center;
		font-weight: 600;
		margin-bottom: 6px;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		line-height: 1.2;
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: #444;
		border-radius: 2px;
		overflow: hidden;
		margin-top: 4px;
	}

	.progress {
		height: 100%;
		background: linear-gradient(90deg, #4caf50, #2196f3);
		transition: width 0.1s linear;
	}

	.progress.expiring {
		background: linear-gradient(90deg, #ff4444, #ff8800);
		animation: flash 0.5s linear infinite alternate;
	}

	.difficulty-indicator {
		position: absolute;
		top: 4px;
		right: 6px;
		color: #ffd700;
		font-size: 12px;
		font-weight: bold;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.golden-indicator {
		position: absolute;
		top: 4px;
		left: 6px;
		font-size: 12px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
	}

	@keyframes flash {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0.7;
		}
	}

	/* Element States */
	.equation-element.golden {
		background: linear-gradient(135deg, #ffd700, #ffed4e);
		color: #000;
		border-color: #daa520;
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
	}

	.equation-element.golden .progress {
		background: linear-gradient(90deg, #b8860b, #daa520);
	}

	.equation-element.hard-problem {
		border-color: #9c27b0;
		background: linear-gradient(135deg, #2d1b69, #1a1a1a);
	}

	.equation-element.correct {
		background: linear-gradient(135deg, #4caf50, #66bb6a);
		border-color: #45a049;
		transform: scale(1.15);
		box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
	}

	.equation-element.missed {
		background: linear-gradient(135deg, #f44336, #ef5350);
		border-color: #d32f2f;
		transform: scale(0.85);
		box-shadow: 0 0 20px rgba(244, 67, 54, 0.6);
	}

	.equation-element.expiring {
		animation: warning-pulse 0.8s ease-in-out infinite alternate;
	}

	@keyframes warning-pulse {
		0% {
			border-color: #333;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}
		100% {
			border-color: #ff4444;
			box-shadow: 0 0 15px rgba(255, 68, 68, 0.4);
		}
	}

	@media (max-width: 768px) {
		.equation-element {
			width: 100px;
			height: 70px;
			font-size: 13px;
			padding: 6px;
		}

		.equation-display {
			font-size: 12px;
		}

		.difficulty-indicator,
		.golden-indicator {
			font-size: 10px;
		}
	}
</style>
