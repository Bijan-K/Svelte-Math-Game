<!-- src/lib/tabs/play/ResponsiveEquationSpawner.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { isMobile } from '$lib/stores.js';

	export let onViewportChange = () => {};

	let viewportWidth = 0;
	let viewportHeight = 0;
	let safeAreaHeight = 0;
	let keyboardHeight = 0;
	let isKeyboardOpen = false;

	// Calculate safe spawn area considering mobile UI elements
	$: safeSpawnArea = calculateSafeArea(
		viewportWidth,
		viewportHeight,
		safeAreaHeight,
		keyboardHeight,
		$isMobile
	);

	function calculateSafeArea(vw, vh, safeHeight, kbHeight, mobile) {
		if (!vw || !vh) return { width: 800, height: 600, offsetY: 0 };

		// Base dimensions
		let width = mobile ? vw : vw * 0.8; // 80vw on desktop, 100vw on mobile
		let height = mobile ? vh * 0.68 : vh * 0.88; // Account for mobile numpad space

		// Account for mobile keyboard
		if (mobile && isKeyboardOpen) {
			height = vh - kbHeight - 100; // Leave space for input and margins
		}

		// Minimum constraints
		width = Math.max(width, 300);
		height = Math.max(height, 200);

		// Calculate safe margins (keep equations away from edges)
		const marginX = Math.min(50, width * 0.05);
		const marginY = Math.min(50, height * 0.05);

		return {
			width: width - marginX * 2,
			height: height - marginY * 2,
			offsetX: marginX,
			offsetY: marginY,
			availableWidth: width,
			availableHeight: height
		};
	}

	function detectKeyboard() {
		// Detect keyboard on mobile by viewport height change
		const initialHeight = window.innerHeight;

		function checkKeyboard() {
			const currentHeight = window.visualViewport
				? window.visualViewport.height
				: window.innerHeight;
			const heightDiff = initialHeight - currentHeight;

			// Keyboard is likely open if height decreased by more than 150px
			const wasKeyboardOpen = isKeyboardOpen;
			isKeyboardOpen = heightDiff > 150;
			keyboardHeight = isKeyboardOpen ? heightDiff : 0;

			// Trigger viewport change if keyboard state changed
			if (wasKeyboardOpen !== isKeyboardOpen) {
				notifyViewportChange();
			}
		}

		// Use visual viewport API if available (better for mobile)
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', checkKeyboard);
			return () => window.visualViewport.removeEventListener('resize', checkKeyboard);
		} else {
			// Fallback for older browsers
			window.addEventListener('resize', checkKeyboard);
			return () => window.removeEventListener('resize', checkKeyboard);
		}
	}

	function notifyViewportChange() {
		onViewportChange(safeSpawnArea);
	}

	// Handle window resize with debouncing
	let resizeTimeout;
	function handleResize() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;
			notifyViewportChange();
		}, 100);
	}

	// Check for safe area support (iOS devices)
	function getSafeAreaHeight() {
		if (CSS.supports('padding: env(safe-area-inset-top)')) {
			const computedStyle = getComputedStyle(document.documentElement);
			const safeTop = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
			const safeBottom = parseInt(
				computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'
			);
			return safeTop + safeBottom;
		}
		return 0;
	}

	onMount(() => {
		// Initialize dimensions
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
		safeAreaHeight = getSafeAreaHeight();

		// Set up listeners
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', () => {
			// Delay to allow orientation change to complete
			setTimeout(() => {
				viewportWidth = window.innerWidth;
				viewportHeight = window.innerHeight;
				notifyViewportChange();
			}, 500);
		});

		// Set up keyboard detection
		const cleanupKeyboard = detectKeyboard();

		// Initial notification
		notifyViewportChange();

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimeout);
			if (cleanupKeyboard) cleanupKeyboard();
		};
	});

	// CSS custom properties for safe areas
	onMount(() => {
		const style = document.createElement('style');
		style.textContent = `
			:root {
				--safe-area-inset-top: env(safe-area-inset-top, 0px);
				--safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
				--safe-area-inset-left: env(safe-area-inset-left, 0px);
				--safe-area-inset-right: env(safe-area-inset-right, 0px);
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	});

	// Export safe area for parent components
	export function getSafeSpawnArea() {
		return safeSpawnArea;
	}

	export function isKeyboardVisible() {
		return isKeyboardOpen;
	}
</script>

<!-- This component is purely functional - no visual output -->
<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<!-- Debug info (only in development) -->
{#if false}
	<div class="debug-info">
		<div>Viewport: {viewportWidth}x{viewportHeight}</div>
		<div>Safe Area: {safeSpawnArea.width}x{safeSpawnArea.height}</div>
		<div>Keyboard: {isKeyboardOpen ? 'Open' : 'Closed'} ({keyboardHeight}px)</div>
		<div>Mobile: {$isMobile ? 'Yes' : 'No'}</div>
	</div>
{/if}

<style>
	.debug-info {
		position: fixed;
		top: 10px;
		left: 10px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.8rem;
		z-index: 1000;
		pointer-events: none;
	}

	.debug-info div {
		margin-bottom: 0.25rem;
	}
</style>
