import { writable } from 'svelte/store';

export let modeState = writable(undefined);
export let showOverlay = writable(true);
