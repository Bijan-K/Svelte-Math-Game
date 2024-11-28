import { writable } from 'svelte/store';

// Basic states
export let modeState = writable(undefined);
export let showOverlay = writable(true);
export let flawsVisibility = writable(false);
export let menuListIsClosed = writable(true);
export let selectedDiff = writable(undefined);

// Mobile
export let mobileMenuState = writable(false);
export let isMobile = writable(false);
export let functionTriggerEnter = writable(false);
export let functionTriggerInput = writable(false);

// Things that get saved
export let record = writable([
	{
		diff: 'ez',
		date: 'no record yet',
		count: 0
	},
	{
		diff: 'mid',
		date: 'no record yet',
		count: 0
	},
	{
		diff: 'high',
		date: 'no record yet',
		count: 0
	}
]);
export let missed_eq_list = writable([]);

// Basically RAM
export let cache = writable({
	diff: 'Null',
	hp: 0,
	score: 0,
	gameState: false,
	userInput: ''
});
