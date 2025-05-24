// src/lib/tabs/play/layout/viewportStore.js

import { writable } from 'svelte/store';

/**
 * Viewport state store for managing responsive layout
 */
export const viewport = writable({
	width: 0,
	height: 0,
	availableHeight: 0,
	isKeyboardOpen: false,
	isMobile: false,
	safeAreaInsets: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}
});

/**
 * Utility functions for viewport management
 */

// Get current viewport state (for non-reactive access)
export function getCurrentViewport() {
	let currentValue;
	viewport.subscribe(value => {
		currentValue = value;
	})();
	return currentValue;
}

// Check if viewport is mobile
export function isMobileViewport() {
	if (typeof window === 'undefined') return false;
	return window.innerWidth <= 768 || 'ontouchstart' in window;
}

// Check if keyboard is visible
export function isKeyboardVisible() {
	if (typeof window === 'undefined') return false;
	const heightDiff = window.innerHeight - (window.visualViewport?.height || window.innerHeight);
	return isMobileViewport() && heightDiff > 150;
}

// Get safe area insets
export function getSafeAreaInsets() {
	if (typeof document === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
	
	const computedStyle = getComputedStyle(document.documentElement);
	return {
		top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
		bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
		left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
		right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
	};
}

// Update viewport state
export function updateViewportState() {
	if (typeof window === 'undefined') return;

	const width = window.innerWidth;
	const height = window.innerHeight;
	const visualHeight = window.visualViewport?.height || height;
	const heightDiff = height - visualHeight;

	// Detect mobile
	const isMobile = isMobileViewport();

	// Detect keyboard (mobile keyboard typically reduces height by 150px+)
	const isKeyboardOpen = isMobile && heightDiff > 150;

	// Calculate available height (account for browser UI and keyboard)
	const availableHeight = isKeyboardOpen ? visualHeight : height;

	// Get safe area insets
	const safeAreaInsets = getSafeAreaInsets();

	const newViewport = {
		width,
		height,
		availableHeight,
		isKeyboardOpen,
		isMobile,
		safeAreaInsets
	};

	viewport.set(newViewport);
	updateCSSProperties(newViewport);
}

// Update CSS custom properties for responsive design
function updateCSSProperties(viewportState) {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;

	// Set viewport-aware custom properties
	root.style.setProperty('--viewport-width', `${viewportState.width}px`);
	root.style.setProperty('--viewport-height', `${viewportState.height}px`);
	root.style.setProperty('--available-height', `${viewportState.availableHeight}px`);
	root.style.setProperty('--safe-top', `${viewportState.safeAreaInsets.top}px`);
	root.style.setProperty('--safe-bottom', `${viewportState.safeAreaInsets.bottom}px`);
	root.style.setProperty('--safe-left', `${viewportState.safeAreaInsets.left}px`);
	root.style.setProperty('--safe-right', `${viewportState.safeAreaInsets.right}px`);

	// Responsive breakpoints
	root.style.setProperty('--is-mobile', viewportState.isMobile ? '1' : '0');
	root.style.setProperty('--is-keyboard-open', viewportState.isKeyboardOpen ? '1' : '0');

	// Game-specific dimensions (mobile-first approach)
	if (viewportState.isMobile) {
		// Mobile: full width, account for safe areas and controls
		const gameHeight = viewportState.availableHeight - 160; // Space for controls
		root.style.setProperty('--game-width', '100vw');
		root.style.setProperty('--game-height', `${gameHeight}px`);
		root.style.setProperty('--aside-width', '100vw');
	} else {
		// Desktop: sidebar + main area
		root.style.setProperty('--game-width', '80vw');
		root.style.setProperty('--game-height', '85vh');
		root.style.setProperty('--aside-width', '20vw');
	}
}