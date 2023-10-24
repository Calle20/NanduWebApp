<script>
	import {
		dndzone,
		TRIGGERS,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
	} from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import { writable } from "svelte/store";

	import Tile from "./Tile.svelte";
	import Square from "./Square.svelte";
	import Led from "./Led.svelte";
	import LedOut from "./LedOut.svelte";

	let idx = 0;

	let items = [
		{ id: idx++, letter: "W" },
		{ id: idx++, letter: "r" },
		{ id: idx++, letter: "R" },
		{ id: idx++, letter: "B" },
	];

	let length = writable(6);
	let height = 5;
	let shouldIgnoreDndEvents = false;

	function handleDndConsider(e) {
		// console.warn(`got consider ${JSON.stringify(e.detail, null, 2)}`);
		const { trigger, id } = e.detail.info;
		if (trigger === TRIGGERS.DRAG_STARTED) {
			console.warn(`copying ${id}`);
			const idx = items.findIndex((item) => item.id === id);
			const newId = `${id}_copy_${Math.round(Math.random() * 100000)}`;
			e.detail.items = e.detail.items.filter(
				(item) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]
			);
			e.detail.items.splice(idx, 0, { ...items[idx], id: newId });
			items = e.detail.items;
			shouldIgnoreDndEvents = true;
		} else if (!shouldIgnoreDndEvents) {
			items = e.detail.items;
		} else {
			items = [...items];
		}
	}
	function handleDndFinalize(e) {
		// console.warn(`got finalize ${JSON.stringify(e.detail, null, 2)}`);
		const { id } = e.detail.info;
		if (!shouldIgnoreDndEvents) {
			window.setTimeout(() => {
				items = items.filter(
					(i) => !i.id.toString().startsWith(`${id}_copy`)
				);
			}, flipDurationMs);
			items = e.detail.items;
		} else {
			items = [...items];
			document.getElementById("rack").style.opacity = 1;
			shouldIgnoreDndEvents = false;
		}
	}

	$: boardGrid = writable(
		Array.from({ length: $length }, (_, i) =>
			Array.from({ length: height }, (_, j) => ({
				id: i * height + j,
			}))
		)
	);

	let letters = writable(
		Array.from({ length: height }, () =>
			Array.from({ length: $length }, () => "X")
		)
	);

	function incrementBoardGridHeight(_e) {
		height += 1;
		$letters.push(Array.from({ height }, () => "X"));
	}
	function decrementBoardGridHeight(_e) {
		height -= 1;
		$letters.pop();
	}
	function incrementBoardGridLength(_e) {
		$length += 1;
		$letters.forEach((array) => array.push("X"));
	}
	function decrementBoardGridLength(_e) {
		$length -= 1;
		$letters.forEach((array) => array.pop());
	}
	// of type { id: number, isOn: bool}
	$: ledGrid = Array.from({ length: $length }, (_, i) =>
		Object.create({
			id: i,
			isOn: false,
		})
	);

	function run(e) {
		if (e.key && e.key !== "Enter") return;

		// const updatedLetters = $letters.map((col) => {
		// 	console.log(
		// 		col.every((x) => x === "X"),
		// 		col
		// 	);
		// 	if (col.every((x) => x === "X")) return;
		// 	else col;
		// });
		// console.log(updatedLetters);

		const leds = ledGrid.map((led) => `Q${led.id}`).join(" ");
		const code = $letters
			.map((col, idx) =>
				col.map((element, jdx) => {
					const prevElement = $letters[idx][jdx - 1];
					if (prevElement === "W" || prevElement === "B")
						return prevElement;
					else return element;
				})
			)
			.join("\n")
			.replaceAll(",", " ");

		console.log(code);

		const program = [$length, height, leds, code].join("\n");
		console.log(program);
	}

	// of type { id: number, isOn: bool}
	let ledGridOut = Array.from({ length: $length }, (_, i) =>
		Object.create({
			id: i,
			isOn: false,
		})
	);

	const flipDurationMs = 10;

	$: options = {
		items,
		flipDurationMs,
		morphDisabled: true,
	};
</script>

<svelte:window on:keydown={run} />
<div class="program-container">
	<div class="column" style="margin: 3em;">
		<div class="grid">
			{#each ledGrid as led}
				<Led id={led.id} bind:ledGrid />
			{/each}
		</div>
		<div class="gridContainer">
			<button
				type="button"
				class="decrementLength btn btn-outline-secondary"
				on:click={decrementBoardGridLength}><h1>-</h1></button
			>
			<button
				type="button"
				class="decrementHeight btn btn-outline-secondary"
				on:click={decrementBoardGridHeight}
				><h1 style="margin-bottom: 0px;line-height: 0.9em;">
					-
				</h1></button
			>
			<div class="main grid">
				{#each $boardGrid as col}
					<div class="column">
						{#each col as row}
							<Square id={row.id} bind:letters />
						{/each}
					</div>
				{/each}
			</div>

			<button
				type="button"
				class="incrementLength btn btn-outline-secondary"
				on:click={incrementBoardGridLength}><h1>+</h1></button
			>
			<button
				type="button"
				class="incrementHeight btn btn-outline-secondary"
				on:click={incrementBoardGridHeight}
				><h1 style="margin-bottom: 0px;line-height: 0.9em;">
					+
				</h1></button
			>
		</div>
		<div class="grid">
			{#each ledGridOut as led}
				<LedOut id={led.id} bind:ledGridOut />
			{/each}
		</div>
	</div>

	<div
		class="rack"
		id="rack"
		use:dndzone={options}
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each items as item (item.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				<Tile letter={item.letter} className={item.letter[0]} />
			</div>
		{/each}
	</div>
	<div class="main-container">
		<button class="btn btn-primary btn-lg" on:click={run}> run</button>
	</div>
</div>

<style>
	:global(body *) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	.program-container {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: row;
		justify-content: center;
		gap: 1vw;
		align-items: top;
		background-color: #272727;
	}
	@media (max-width: 800px) {
		.program-container {
			flex-direction: column;
		}
	}
	.main-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.grid {
		/* border: 2px solid aliceblue; */
		display: flex;
		flex-direction: row;
		justify-content: left;
	}
	.column {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.gridContainer {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: auto;
		grid-template-rows: auto;
		row-gap: 0px;
		grid-template-areas:
			". decrementHeight ."
			"decrementLength main incrementLength"
			". incrementHeight .";
	}
	.main {
		grid-area: main;
	}
	.incrementHeight {
		grid-area: incrementHeight;
		width: 100%;
		height: 2.6em;
		padding: 0;
	}
	.decrementHeight {
		grid-area: decrementHeight;
		width: 100%;
		height: 2.6em;
		padding: 0;
	}
	.incrementLength {
		grid-area: incrementLength;
		padding: 0;
		width: 2.6em;
		height: 100%;
	}
	.decrementLength {
		grid-area: decrementLength;
		padding: 0;
		width: 2.6em;
		height: 100%;
	}
	.rack {
		display: flex;
		justify-content: center;
		flex-direction: column;
		flex-grow: 0;
		/* width: calc((min(10vmin, 50px) + 4px) * 7); */
	}
	.rack > * {
		margin: 2px;
	}
</style>
