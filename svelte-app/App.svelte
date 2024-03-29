<script>
	import {
		dndzone,
		TRIGGERS,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		SOURCES,
	} from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import { writable } from "svelte/store";

	import Tile from "./Tile.svelte";
	import Square from "./Square.svelte";
	import Led from "./Led.svelte";
	import LedOut from "./LedOut.svelte";
	import InfoBox from "./InfoBox.svelte";
	import ActiveBackground from "./ActiveBackground.svelte";
	import { hasRun, hasLengthDecreased } from "./store";
	import Delete_forever from "svelte-google-materialdesign-icons/Delete_forever.svelte";
	import Play_icon from "svelte-google-materialdesign-icons/Play_arrow.svelte";
	import Build_icon from "svelte-google-materialdesign-icons/Build.svelte";

	let idx = 0;

	let items = [
		{ id: idx++, letter: "W" },
		{ id: idx++, letter: "r R" },
		{ id: idx++, letter: "R r" },
		{ id: idx++, letter: "B" },
	];

	// let hasRun = writable(false);
	$: $hasRun = !!(items - items + $length - $length + height - height);
	let state = writable([]);
	if (!$hasRun) state.set([]);
	let length = writable(6);
	$: gridLedState = writable([]);
	let height = 5;
	let shouldIgnoreDndEvents = false;
	$: gridQs = writable([]);

	function handleDndConsider(e) {
		const { trigger, id, source } = e.detail.info;
		if (source === SOURCES.KEYBOARD) return;
		if (trigger === TRIGGERS.DRAG_STARTED) {
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
		const { id, source } = e.detail.info;
		if (source === SOURCES.KEYBOARD) return;
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
		$letters.push(Array.from({ length: $length }, () => "X"));
	}
	function decrementBoardGridHeight(_e) {
		if (height === 1) return;
		height -= 1;
		$letters.pop();
	}
	function incrementBoardGridLength(_e) {
		$length += 1;
		$letters.forEach((array) => array.push("X"));
	}
	function decrementBoardGridLength(_e) {
		if ($length === 1) return;
		$length -= 1;
		$letters.forEach((array, idx) => {
			if (
				array[$length - 1].toLowerCase === "r" ||
				array[$length - 1] === "W" ||
				array[$length - 1] === "B"
			) {
				$letters[idx][$length - 1] = "X";
				$hasLengthDecreased = !$hasLengthDecreased;
			}
			array.pop();
		});
	}
	// of type { id: number, isOn: bool}
	$: ledGrid = writable(
		Array.from({ length: $length }, (_, i) =>
			Object.create({
				id: i,
				isOn: false,
				isActive: false,
			})
		)
	);

	// of type { id: number, isOn: bool}
	$: ledGridOut = writable(
		Array.from({ length: $length }, (_, i) =>
			Object.create({
				id: i,
				isOn: false,
				isActive: false,
			})
		)
	);

	$: if (!$hasRun) {
		$ledGrid.forEach((led) => (led.isActive = false));
		$ledGridOut.forEach((led) => (led.isActive = false));
	}

	function run(e) {
		if (e.key && e.key === "Escape" && $hasRun) {
			$hasRun = false;
			return;
		}
		if (e.key && e.key !== "Enter") return;

		if ($hasRun) {
			$hasRun = false;
			return;
		}

		let codeLength = $length;
		let leds = $ledGrid.slice();
		let code = $letters.map((col, idx) =>
			col.map((element, jdx) => {
				const prevElement = $letters[idx][jdx - 1];
				switch (prevElement) {
					case "W":
					case "B":
						return prevElement;
					case "R":
						return "r";
					case "r":
						return "R";
					default:
						return element;
				}
			})
		);

		function trailCode() {
			while (code[0].every((x) => x === "X")) {
				code.splice(0, 1);
				leds.splice(0, 1);
				codeLength--;
			}
			code = code.reverse();
			leds = leds.reverse();
		}

		if (code.every((x) => x.every((y) => y === "X"))) return;

		// this whole thing basically removes trailing rows which are filled with X's
		code = code[0].map((_, i) => code.map((row) => row[i])); // invert code => code[row][col] -> code[col][row]
		trailCode();
		trailCode();
		code = code[0].map((_, i) => code.map((row) => row[i]));

		let lamps = leds.map((led) => `Q${led.id}`);
		let lampsOut = leds.map((led) => `L${led.id}`);
		leds.forEach((led, idx) => {
			const firstBlockLetter = code.slice(0, 1)[0][idx];
			if (
				firstBlockLetter !== "X" &&
				firstBlockLetter[0] !== "Q" &&
				firstBlockLetter !== "r"
			)
				$ledGrid[led.id].isActive = true;
			else lamps[idx] = "X";

			const lastBlockLetter = code.slice(-1)[0][idx];
			if (lastBlockLetter !== "X" && lastBlockLetter[0] !== "L")
				$ledGridOut[led.id].isActive = true;
			else lampsOut[idx] = "X";
		});

		lamps = lamps.join(" ");
		lampsOut = lampsOut.join(" ");

		code = code.join("\n").replaceAll(",", " ");

		const program = [
			[codeLength, height + 2].join(" "),
			lamps,
			code,
			lampsOut,
		].join("\n");

		fetch("/calculate", { method: "POST", body: program })
			.then((response) => response.json())
			.then((json) => ($state = json));

		$hasRun = true;
	}

	$: breakme: if ($ledGrid && $hasRun && $gridQs) {
		let ledGridCp = $gridQs.concat($ledGrid);
		ledGridCp = ledGridCp.filter((value) =>
			value ? value.isActive : false
		);

		let target = {};
		ledGridCp.forEach((x) => (target[`Q${x.id}`] = x.isOn));

		const ledOut = $state.find((obj) =>
			Object.keys(target).every((key) => obj[key] === target[key])
		); // find object in array of objects, thanks phind

		if (!ledOut) break breakme;

		$gridLedState = ledOut;

		$ledGridOut
			.filter((value) => value.isActive)
			.forEach((led) => {
				led.isOn = ledOut[`L${led.id}`];
			});

		$ledGridOut = [...$ledGridOut];
	} // the code for the output leds when the input leds change

	const flipDurationMs = 100;

	$: options = {
		items,
		flipDurationMs,
		morphDisabled: true,
	};
</script>

<svelte:window on:keydown={run} />

<svelte:head>
	{#if $hasRun}
		<link rel="icon" href="favicon2.ico?v=6" sizes="any" />
		<link rel="icon" href="favicon2.svg?v=6" type="image/svg+xml" />
		<link rel="apple-touch-icon" href="apple-touch-icon2.png?v=6" />
		<link rel="manifest" href="site2.webmanifest" />
		<meta name="theme-color" content="#4a4a4a" />
	{:else}
		<link rel="icon" href="favicon.ico?v=5" sizes="any" />
		<link rel="icon" href="favicon.svg?v=5" type="image/svg+xml" />
		<link rel="apple-touch-icon" href="apple-touch-icon.png?v=5" />
		<link rel="manifest" href="site.webmanifest" />
		<meta name="theme-color" content="#4a4a4a" />
	{/if}
</svelte:head>

<div class="program-container">
	<InfoBox />
	<div class="column" style="margin: 3em;">
		<div class="grid">
			{#if $hasRun}
				{#each $ledGrid as led}
					<Led id={led.id} bind:ledGrid />
				{/each}
			{:else}
				<div style="height: calc(2px + min(5vmin, 50px));" />
			{/if}
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
							<Square
								id={row.id}
								bind:letters
								bind:gridLedState
								bind:gridQs
							/>
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
			{#if $hasRun}
				{#each $ledGridOut as led}
					<LedOut id={led.id} bind:ledGridOut />
				{/each}
			{:else}
				<div style="height: calc(2px + min(5vmin, 50px));" />
			{/if}
		</div>
	</div>

	<div
		class="rack"
		id="rack"
		use:dndzone={options}
		use:dndzone={{
			items,
			flipDurationMs,
			dropTargetStyle: {
				outline: "#f43f5e solid 2px",
				borderRadius: "calc(min(5vmin, 50px) / 6.25)	",
			},
		}}
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
		<div>
			<button
				class="btn {$hasRun ? 'btn-secondary' : 'btn-success'} btn-lg"
				on:click={run}
			>
				<div inert>
					{#if $hasRun}
						<Build_icon />
					{:else}
						<Play_icon />
					{/if}
				</div>
			</button>
		</div>
		<div>
			<button
				class="btn btn-danger btn-lg"
				on:click={() => location.reload()}
			>
				<div inert>
					<Delete_forever />
				</div>
			</button>
		</div>
	</div>
	<div style="min-height: 22vh;">
		<div class="collapse collapse-horizontal" id="collapse">
			<div class="card" style="width: 28vw; opacity:0;" />
		</div>
	</div>
	{#if $hasRun}
		<ActiveBackground />
	{/if}
</div>

<style>
	:global(body *) {
		margin: 0;
		padding: 0;
	}

	.program-container {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		flex-direction: row;
		justify-content: safe center;
		gap: 1vw;
		align-items: safe center;
		background-color: #272727;
	}
	.main-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.main-container > * {
		margin-top: 3vmin;
	}
	.rack {
		display: flex;
		justify-content: center;
		flex-direction: column;
		flex-grow: 0;
	}
	.rack > * {
		margin: 2px;
	}

	@media (max-width: 800px) {
		.program-container {
			flex-direction: column;
			align-items: safe center;
		}
		.rack {
			width: calc(2 * max(10vmin, 100px));
			justify-content: flex-start;
			flex-direction: row;
			flex-wrap: wrap;
		}
		.main-container {
			flex-direction: row;
		}
		.main-container > * {
			margin: 3vmin;
		}
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
</style>
