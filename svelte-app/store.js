import { writable } from 'svelte/store';
export let hasRun = writable(false);
export let counter = writable(2048); // to ensure not to collide with the bottom leds and Qs
export let hasLengthDecreased = writable(false) // it changes to true or false when it has decreased, so when it changes to false it doesn't mean it didn't change.