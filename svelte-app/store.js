import { writable } from 'svelte/store';
// export const length = writable(6);
// export const height = writable(5);
export let hasRun = writable(false);
export let ledCounter = writable(1024); // to ensure not to collide with the bottom leds
// console.log(length)
// export const boardGrid = writable(
//     Array.from({ length: length }, (_, i) =>
//         Array.from({ length: height }, (_, j) => ({
//             id: i * height + j,
//             letter: "X",
//         }))
//     )
// );

// export const letters = writable(Array.from({length: length}, (_, _) =>
//         Array.from({length: height}, (_, _) => "X X")
// ))