import { writable } from 'svelte/store';

export let modeState = writable(undefined);
export let showOverlay = writable(true);
export let flawsVisibility = writable(false);
export let settingOpen = writable(false);

export let stats = writable({
	record: {
		ez: {
			date: '',
			count: 0
		},
		mid: {
			date: '',
			count: 0
		},
		high: {
			date: '',
			count: 0
		}
	}
});

export let mistakes = writable({});

export let misses = writable([
	{
		equation: '',
		times: 0
	}
]);
