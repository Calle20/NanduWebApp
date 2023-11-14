<script>
    import {
        dndzone,
        TRIGGERS,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";
    import Tile from "./Tile.svelte";
    import { writable } from "svelte/store";
    import { counter, hasRun } from "./store";
    import { tick } from "svelte";

    export let id;
    export let letters;
    export let gridLedState;
    export let gridQs;

    let items = [];
    const background = "rgba(255, 255, 255, 0.2)";

    let currentId = 0;
    let previousId = writable(0);
    let flipDurationMs = 100;

    let ledIdx = 0;
    let qIdx = $counter;
    $counter++;
    $: isLed = false;
    $: isQ = false;
    $: Q = {
        id: qIdx,
        isOn: false,
        isActive: false,
    };
    $gridQs.push(Q);

    async function handleDndConsider(e) {
        $hasRun = false;
        const id = parseInt(e.target.id);
        const { trigger } = e.detail.info;
        const itemList = e.detail.items;
        const height = $letters.length;
        const y = Math.floor(id / height);
        const x = id % height;

        if (trigger === TRIGGERS.DRAGGED_LEFT) {
            const square = document.getElementById(currentId + height);
            if (square) square.style.backgroundColor = null;

            const currentY = Math.floor(currentId / height);
            const currentX = currentId % height;
            const element = document.getElementById(currentId);

            const previousSquare = document.getElementById($previousId);
            if (previousSquare) previousSquare.style.backgroundColor = null;
        } else if (trigger !== TRIGGERS.DRAG_STARTED) {
            if (itemList[0]) {
                const square = document.getElementById(id + height);
                if (square) {
                    await tick();
                    square.style.opacity = 1;
                    square.style.backgroundColor = background;
                }

                currentId = id;
            }
        } else if (trigger === TRIGGERS.DRAG_STARTED) {
            $letters[x][y] = "X";
        }
        if (
            $letters[x][y - 1] &&
            $letters[x][y - 1] !== "X" &&
            $letters[x][y - 1][0] !== "L" &&
            $letters[x][y - 1][0] !== "Q"
        ) {
            window.setTimeout(() => {
                document.getElementById(id).style.opacity = 0;
            }, 1);
        }
        items = e.detail.items;
    }

    function handleDndFinalize(e) {
        const id = parseInt(e.target.id);
        const height = $letters.length;
        const y = Math.floor(id / height); // the x values in the array are the columns in the elements, vice versa
        const x = id % height; // It works hence you will not change it.
        // I have y and x switched bc the letters must be [row][column] (see the example files), so x is actually y
        previousId.set(id + height);

        if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
            const new_letter = e.detail.items[0].letter[0];
            let rightSquare = document.getElementById(id + height);

            if (
                (rightSquare && rightSquare.hasChildNodes()) || // if there's a square/LED on the right square
                (rightSquare &&
                    ($letters[x][y + 1][0] === "L" ||
                        $letters[x][y + 1][0] === "Q")) // or there is an LED beneath it
            ) {
                rightSquare = undefined;
            }

            if (
                rightSquare &&
                $letters[x][y - 1] &&
                $letters[x][y - 1] !== "X" &&
                $letters[x][y - 1][0] !== "L" &&
                $letters[x][y - 1][0] !== "Q" // or there is a square (but not an LED) to the left of it
            )
                rightSquare = false; // to ensure that it's not possible to drag one onto another

            if ($letters[x][y] !== "X") rightSquare = false;

            if (rightSquare) {
                rightSquare.style.opacity = 0;
                $letters[x][y] = new_letter;
            } else {
                window.setTimeout(() => {
                    items = [];
                    if (rightSquare === false) {
                        if (
                            $letters[x][y][0] !== "L" &&
                            $letters[x][y][0] !== "Q"
                        )
                            document.getElementById(id).style.opacity = 0;
                        document.getElementById(
                            id + height
                        ).style.backgroundColor = null;
                        document.getElementById(id).style.backgroundColor =
                            null;
                    } else if (rightSquare === undefined) {
                        document.getElementById(
                            id + height
                        ).style.backgroundColor = null;
                        if (
                            $letters[x][y - 1] &&
                            $letters[x][y - 1] !== "X" &&
                            $letters[x][y - 1][0] !== "L" &&
                            $letters[x][y - 1][0] !== "Q"
                        )
                            document.getElementById(id).style.opacity = 0;
                    }
                }, 5);
                items = e.detail.items;
                return;
            }
        } else if (e.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY) {
            const rightSquare = document.getElementById(id + height);
            if (rightSquare) rightSquare.style.opacity = 0;
        } else {
            $letters[x][y] = "X";
        }
        const prevSquare = document.getElementById(id + height);
        if (prevSquare) prevSquare.style.backgroundColor = null;

        items = e.detail.items;
    }

    $: options = {
        dropFromOthersDisabled: items.length,
        items,
        dropTargetStyle: {},
        flipDurationMs,
    };

    function onClick(e) {
        const isDivElement = e.target.tagName === "DIV";
        const id = parseInt(
            isDivElement ? e.target.id : e.target.parentNode.id
        );
        const height = $letters.length;
        const y = Math.floor(id / height);
        const x = id % height;
        if (
            $letters[x][y - 1] &&
            $letters[x][y - 1][0] !== "L" &&
            $letters[x][y - 1][0] !== "Q" &&
            $letters[x][y - 1] !== "X"
        )
            return;

        const element = document.getElementById(id);
        if ($hasRun && isQ) {
            Q.isOn = !Q.isOn;
            Q.isOn
                ? (element.style.backgroundColor = "#198754")
                : (element.style.backgroundColor = "red");
            return;
        }
        $hasRun = false;

        if (isLed) {
            $letters[x][y] = `Q${qIdx}`;
            Q.isActive = true;
            element.style.backgroundColor = null;
            isQ = true;

            isLed = false;
            return;
        }
        if (isQ) {
            Q.isActive = false;

            setTimeout(() => ($letters[x][y] = "X"), 100);
            element.style.backgroundColor = null;
            isQ = false;
            return;
        }
        ledIdx = $counter;
        $letters[x][y] = "L" + $counter;
        isLed = true;
        $counter++;
    }

    $: if (Q) {
        tick().then(() => ($gridQs[id] = Q));
    }

    $: if ($hasRun && isLed) {
        tick().then(() => {
            const led = Object.keys($gridLedState).find(
                (x) => x == [`L${ledIdx}`]
            );
            const element = document.getElementById(id);
            element.style.backgroundColor = $gridLedState[led]
                ? "#198754"
                : "red";
        });
    }
    $: if ($hasRun && isQ) {
        tick().then(() => {
            let element = document.getElementById(id);
            Q.isOn
                ? (element.style.backgroundColor = "#198754")
                : (element.style.backgroundColor = "red");
        });
    }

    $: if (!$hasRun && document.getElementById(id)) {
        const height = $letters.length;
        const y = Math.floor(id / height);
        const x = id % height;

        if ($letters[x][y][0] === "L") {
            const element = document.getElementById(id);
            element.style.backgroundColor = null;
        } else if ($letters[x][y][0] === "Q") {
            const element = document.getElementById(id);
            element.style.backgroundColor = null;
        }
    }
</script>

<div
    on:mousedown={onClick}
    class="square {isLed ? 'out' : isQ ? 'led' : ''}"
    {id}
    style={items.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
        ? `background: ${background}`
        : ""}
    use:dndzone={options}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
>
    {#each items as tile (tile.id)}
        <Tile letter={tile.letter} className={tile.letter[0]} />
    {/each}
</div>

<style>
    .square {
        border: 2px solid #272727;
        height: calc(min(5vmin, 50px));
        width: calc(min(5vmin, 50px));
        border-radius: calc(min(5vmin, 50px) / 6.25);
        background-color: #404040;
    }
    .led,
    .out {
        /* From https://css.glass */
        background: #626262;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(9.1px);
        -webkit-backdrop-filter: blur(9.1px);
        border: 1px solid rgba(255, 255, 255, 1);
    }
    .out::before,
    .led::before {
        font-size: 2.125rem; /* h1 font-size */
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    .out::before {
        content: "L";
    }

    .led::before {
        content: "Q";
    }
    :focus {
        outline: none;
    }
</style>
