import { writable } from 'svelte/store';

export let modeState = writable(undefined);
export let showOverlay = writable(true);
export let flawsVisibility = writable(false);
export let settingOpen = writable(true);
export let selectedDiff = writable(undefined);

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

export let cache = writable({
	diff: 'Null',
	hp: 5,
	score: 0,
	gameState: false,
	userInput: ''
});
