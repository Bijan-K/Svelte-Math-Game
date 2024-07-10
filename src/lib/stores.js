import { writable } from 'svelte/store';

export let modeState = writable(undefined);
export let showOverlay = writable(true);
export let flawsVisibility = writable(false);
export let settingOpen = writable(false);

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

export let misses = writable([
	{
		equation: '2+2',
		times: 5,
		answer: '4'
	},
	{
		equation: '2+2',
		times: 5,
		answer: '4'
	},
	{
		equation: '2+2',
		times: 5,
		answer: '4'
	},
	{
		equation: '2+2',
		times: 5,
		answer: '4'
	},
	{
		equation: '2+2',
		times: 5,
		answer: '4'
	}
]);
