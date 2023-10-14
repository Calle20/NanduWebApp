<script>
	import {
		dndzone,
		TRIGGERS,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
	} from "svelte-dnd-action";
	import { flip } from "svelte/animate";

	import Tile from "./Tile.svelte";
	import Square from "./Square.svelte";
	import Led from "./Led.svelte";

	let idx = 0;

	let items = [
		{ id: idx++, letter: "X" },
		{ id: idx++, letter: "B" },
		{ id: idx++, letter: "C" },
		{ id: idx++, letter: "D" },
		{ id: idx++, letter: "E" },
		{ id: idx++, letter: "F" },
		{ id: idx++, letter: "G" },
	];

	let length = 10;
	let shouldIgnoreDndEvents = false;

	function handleDndConsider(e) {
		console.warn(`got consider ${JSON.stringify(e.detail, null, 2)}`);
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
		console.warn(`got finalize ${JSON.stringify(e.detail, null, 2)}`);
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
			shouldIgnoreDndEvents = false;
		}
	}

	// of type { id: number }[][];
	const boardGrid = Array.from({ length }, (_, i) =>
		Array.from({ length }, (_, j) => ({ id: i * length + j }))
	);

	// of type { id: number, isOn: bool}
	const ledGrid = Array.from({ length: 2 * length }, (_, i) =>
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

<div class="program-container">
	<div class="container">
		<div class="grid">
			{#each ledGrid as led}
				<Led {...led} />
			{/each}
		</div>
		<div class="grid">
			{#each boardGrid as col}
				<div class="col">
					{#each col as square}
						<Square />
					{/each}
				</div>
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
			<div
				animate:flip={{ duration: flipDurationMs }}
				class={item.letter}
			>
				<Tile letter={item.letter} />
			</div>
		{/each}
	</div>
	<div class="container">
		<button id="run" value="run" />
		<label for="run">run</label>
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
		align-items: top;
		background-color: #272727;
	}
	.container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.grid {
		border: 4px solid silver;
		display: flex;
		flex-direction: row;
		justify-content: left;
	}
	.col {
		display: flex;
		flex-direction: column;
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
	:global(.B) {
		background-color: aliceblue;
	}

	:global(.X) {
		background-color: red;
	}
</style>
