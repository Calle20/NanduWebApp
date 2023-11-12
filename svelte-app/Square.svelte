<script>
    import {
        dndzone,
        TRIGGERS,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";
    // import { boardGrid } from "./store";
    import Tile from "./Tile.svelte";
    import { writable } from "svelte/store";
    import { ledCounter, hasRun } from "./store";
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
    $: isLed = false;
    $: isQ = false;
    $: Q = {
        id: id + 1024,
        isOn: false,
        isActive: false,
    };
    $gridQs.push(Q);
    let ledIdx = 0;
    // $: prevId = $previousId;

    async function handleDndConsider(e) {
        $hasRun = false;
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
            if (square) square.style.backgroundColor = null;

            const currentY = Math.floor(currentId / height);
            const currentX = currentId % height;
            const element = document.getElementById(currentId);

            if ($letters[currentX][currentY][0] === "L") {
                element.innerHTML = null;
                setTimeout(
                    () =>
                        (element.innerHTML = "<h3 class='centerLetter'>L</h3>"),
                    100
                );
            } else if ($letters[currentX][currentY][0] === "Q") {
                element.innerHTML = null;
                setTimeout(
                    () =>
                        (element.innerHTML = "<h3 class='centerLetter'>Q</h3>"),
                    100
                );
            }

            console.log("FIRST!");
            // const currentSquare = document.getElementById(id + height);
            // if (currentSquare) currentSquare.style.backgroundColor = background;

            const previousSquare = document.getElementById($previousId);
            console.log($previousId);
            if (previousSquare) previousSquare.style.backgroundColor = null;

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
            if (itemList[0]) {
                const square = document.getElementById(id + height);
                if (square) {
                    await tick();
                    square.style.opacity = 1;
                    square.style.backgroundColor = background;

                    console.log("SECOND!");
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
            $letters[x][y - 1] !== "X" &&
            $letters[x][y - 1][0] !== "L" &&
            $letters[x][y - 1][0] !== "Q"
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
            const new_letter = e.detail.items[0].letter[0];
            // $letters[x][y + 1] = new_letter;
            // const isR = new_letter.toLowerCase() === "r";
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
                // !isR &&
                $letters[x][y - 1] &&
                $letters[x][y - 1] !== "X" &&
                $letters[x][y - 1][0] !== "L" &&
                $letters[x][y - 1][0] !== "Q" // or there is a square (but not an LED) to the left of it
            )
                rightSquare = false; // to ensure that it's not possible to drag one onto another

            if ($letters[x][y] !== "X") rightSquare = false;
            console.log(rightSquare, $letters[x][y - 1] !== "X");

            console.log(rightSquare);
            if (rightSquare) {
                rightSquare.style.opacity = 0;
                $letters[x][y] = new_letter;
            }
            // console.log(rightSquare, typeof rightSquare);
            else {
                window.setTimeout(() => {
                    items = [];
                    // rightSquare = document.getElementById(id + height);
                    if (rightSquare === false) {
                        // if (
                        //     ($letters[x][y - 1] &&
                        //         $letters[x][y - 1] !== "X") ||
                        //     $letters[x][y][0] === "L"
                        // ) {
                        if (
                            $letters[x][y][0] !== "L" &&
                            $letters[x][y][0] !== "Q"
                        )
                            document.getElementById(id).style.opacity = 0;
                        else {
                            const element = document.getElementById(id);
                            console.warn($letters[x][y][0]);
                            if ($letters[x][y][0] === "L") {
                                element.innerHTML = null;
                                setTimeout(
                                    () =>
                                        (element.innerHTML =
                                            "<h3 class='centerLetter'>L</h3>"),
                                    100
                                );
                            } else if ($letters[x][y][0] === "Q") {
                                element.innerHTML = null;
                                setTimeout(
                                    () =>
                                        (element.innerHTML =
                                            "<h3 class='centerLetter'>Q</h3>"),
                                    100
                                );
                            }
                        }

                        document.getElementById(
                            id + height
                        ).style.backgroundColor = null;
                        document.getElementById(id).style.backgroundColor =
                            null;
                        // }
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
                        console.log("none");
                    }
                }, 5);
                items = e.detail.items;
                // $letters[x][y] = "X";
                console.warn(e);
                return;
            }

            // $previousIdForLetterArray = id;
            // console.log(id, $previousId, $previousIdForLetterArray);
        } else if (e.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY) {
            const rightSquare = document.getElementById(id + height);
            if (rightSquare) rightSquare.style.opacity = 0;
        } else {
            $letters[x][y] = "X";
        }
        // console.log($letters[x][y], length, height, x, y);
        // console.log($letters);
        // document.getElementById("rack").style.opacity = 1;
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

    // $: console.log(items);

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
            // led = $ledGrid.find((x) => x.id == id + 1024).isOn;
            // $ledGrid.find((x) => x.id == id + 1024).isOn = !led;
            Q.isOn = !Q.isOn;
            Q.isOn
                ? (element.style.backgroundColor = "#198754")
                : (element.style.backgroundColor = null);

            // console.log($gridQs);
            // const idx = $gridQs.findIndex((x) => (x.id = id + 1024));
            // console.log(idx);
            // $gridQs[idx].isOn = Q.isOn;
            // console.log(Q, $gridQs);
            return;
        }
        $hasRun = false;

        if (isLed) {
            // setTimeout(() => ($letters[x][y] = "X"), 100);
            // $ledGrid.push(
            //     Object.create({
            //         id: id + 1024,
            //         isOn: false,
            //         isActive: true,
            //     })
            // );
            $letters[x][y] = `Q${id + 1024}`;
            Q.isActive = true;
            // $gridQs.push(Q);
            console.log($gridQs);
            element.innerHTML = "<h3 class='centerLetter'>Q</h3>";
            element.style.backgroundColor = null;
            isQ = true;

            isLed = false;
            return;
        }
        if (isQ) {
            // const idx = $gridQs.findIndex((x) => (x.id = id + 1024));
            // $gridQs = $gridQs.filter((x) => x.isActive === false);
            // $gridQs.splice(idx, 1);
            Q.isActive = false;

            setTimeout(() => console.warn($gridQs), 100);
            setTimeout(() => ($letters[x][y] = "X"), 100);
            element.innerHTML = null;
            element.style.backgroundColor = null;
            isQ = false;
            return;
        }
        element.innerHTML = "<h3 class='centerLetter'>L</h3>";
        ledIdx = $ledCounter;
        $letters[x][y] = "L" + $ledCounter;
        isLed = true;
        $ledCounter++;
        console.log($letters);
    }

    // $: isQ ? (Q.isActive = true) : (Q.isActive = false);
    $: if (Q) {
        tick().then(() => ($gridQs[id] = Q));
        // const idx = $gridQs.findIndex((x) => (x.id = id + 1024));
    }

    $: if ($hasRun && isLed) {
        tick().then(() => {
            console.log(ledIdx, $gridLedState);
            const led = Object.keys($gridLedState).find(
                (x) => x == [`L${ledIdx}`]
            );
            const element = document.getElementById(id);
            element.style.backgroundColor = $gridLedState[led]
                ? "#198754"
                : "red";
        });
    }

    $: if (!$hasRun && document.getElementById(id)) {
        const height = $letters.length;
        const y = Math.floor(id / height);
        const x = id % height;

        if ($letters[x][y][0] === "L") {
            const element = document.getElementById(id);
            element.style.backgroundColor = null;
            console.log("NULLED!");
            // element.innerHTML = null;
            $letters[x][y][0] === "X";
        }
    }
</script>

<div
    on:mousedown={onClick}
    class="square {isLed || isQ ? 'led' : ''}"
    {id}
    style={items.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
        ? `background: ${background}`
        : ""}
    use:dndzone={options}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
>
    <!-- {#if isLed}
        <span />
    {/if} -->
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
    .led {
        /* From https://css.glass */
        background: #626262;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(9.1px);
        -webkit-backdrop-filter: blur(9.1px);
        border: 1px solid rgba(255, 255, 255, 1);
    }
    :focus {
        outline: none;
    }
    :global(.centerLetter) {
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
</style>
