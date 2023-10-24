<script>
    import {
        dndzone,
        TRIGGERS,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";
    // import { boardGrid } from "./store";
    import Tile from "./Tile.svelte";
    import { writable } from "svelte/store";

    export let id;
    export let letters;

    let items = [];
    const background = "rgba(255, 255, 255, 0.2)";

    let currentId = 0;
    let previousId = writable(0);
    let previousIdForOpacity = writable(undefined);
    const flipDurationMs = 10;
    // $: prevId = $previousId;

    function handleDndConsider(e) {
        const id = parseInt(e.target.id);
        const { trigger } = e.detail.info;
        const itemList = e.detail.items;
        const height = $letters.length;
        const y = Math.floor(id / height);
        const x = id % height;

        // console.log(e.detail);
        // console.log(itemList[0].letters.toLowerCase());

        console.log(trigger);
        if (trigger === TRIGGERS.DRAGGED_LEFT) {
            const square = document.getElementById(currentId + height);
            if (square) square.style.backgroundColor = "#404040";

            const previousSquare = document.getElementById($previousId);
            console.log($previousId);
            if (previousSquare)
                previousSquare.style.backgroundColor = "#404040";

            // const previousLeftSquare = document.getElementById(
            //     $previousIdForOpacity
            // );
            // if (previousLeftSquare) previousLeftSquare.style.opacity = 0;
            // console.log(previousLeftSquare, $previousIdForOpacity);
            // } else if (trigger === TRIGGERS.DRAG_STARTED) {
            //     const square = document.getElementById(id + height);
            //     console.log(square);
            //     if (square) square.style.backgroundColor = "#404040";
        } else if (trigger !== TRIGGERS.DRAG_STARTED) {
            if (itemList[0] && itemList[0].letter.toLowerCase() !== "r") {
                const square = document.getElementById(id + height);
                if (square) {
                    square.style.opacity = 1;
                    square.style.backgroundColor = background;
                }
                console.log(square);

                currentId = id;
            }
        } else if (trigger === TRIGGERS.DRAG_STARTED) {
            $letters[x][y] = "X";
        }
        console.log($letters[x][y - 1]);
        if (
            $letters[x][y - 1] &&
            ($letters[x][y - 1] === "W" || $letters[x][y - 1] === "B")
        ) {
            // $previousIdForOpacity = id;
            console.warn("HI");
            window.setTimeout(() => {
                document.getElementById(id).style.opacity = 0;
            }, 1);
        }
        items = e.detail.items;
        // if ($letters[x][y - 1] !== "X")
        //     document.getElementById(id).style.opacity = 0;
    }
    function handleDndFinalize(e) {
        const id = parseInt(e.target.id);
        // console.log(id);
        const height = $letters.length;
        const y = Math.floor(id / height); // the x values in the array are the columns in the elements, vice versa
        const x = id % height; // It works hence you will not change it.
        // I have y and x switched bc the letters must be [row][column] (see the example files), so x is actually y
        // console.log(e.detail.items[0].letter);
        previousId.set(id + height);

        console.log(e);
        console.log($previousId);

        if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
            const new_letter = e.detail.items[0].letter;
            // $letters[x][y + 1] = new_letter;
            const isR = new_letter.toLowerCase() === "r";
            let rightSquare = document.getElementById(id + height);

            if (
                rightSquare &&
                !isR &&
                (rightSquare.hasChildNodes() ||
                    $letters[x][y - 1] === "W" ||
                    $letters[x][y - 1] === "B")
            )
                rightSquare = false; // to ensure that it's not possible to drag one onto another
            console.log(rightSquare, $letters[x][y - 1] !== "X");
            $letters[x][y] = new_letter;
            // if (rightSquare === false &&)
            // console.log($letters[x][y]);
            // if (
            //     rightSquare === false &&
            //     ($letters[x][y] === "W" || $letters[x][y] === "B")
            // ) {
            //     rightSquare = NaN; // to ensure that it's not possible to drag an "r" (or "R") onto another
            // }

            console.log(rightSquare);
            if (rightSquare && !isR) rightSquare.style.opacity = 0;
            console.log(rightSquare, typeof rightSquare);
            if (rightSquare === false || (rightSquare === undefined && !isR)) {
                window.setTimeout(() => {
                    items = [];
                    rightSquare === false
                        ? (document.getElementById(id).style.opacity = 0)
                        : (document.getElementById(id).style.opacity = 1);
                }, flipDurationMs);
                items = e.detail.items;
                $letters[x][y] = "X";
                console.warn(e);
                return;
            }

            // $previousIdForLetterArray = id;
            // console.log(id, $previousId, $previousIdForLetterArray);
        } else if (e.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY) {
            const new_letter = e.detail.items[0].letter;
            const rightSquare =
                new_letter.toLowerCase() === "r"
                    ? false
                    : document.getElementById(id + height);
            if (rightSquare) rightSquare.style.opacity = 0;
        } else {
            $letters[x][y] = "X";
        }
        // console.log($letters[x][y], length, height, x, y);
        // console.log($letters);
        document.getElementById("rack").style.opacity = 1;
        const prevSquare = document.getElementById(id + height);
        if (prevSquare) prevSquare.style.backgroundColor = "#404040";

        items = e.detail.items;
    }

    $: options = {
        dropFromOthersDisabled: items.length,
        items,
        dropTargetStyle: {},
        flipDurationMs,
    };

    // $: console.log(items);
</script>

<div
    class="square"
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
</style>
