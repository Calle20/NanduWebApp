import { writable } from 'svelte/store';
export let hasRun = writable(false);
export let counter = writable(2048); // to ensure not to collide with the bottom leds and Qs