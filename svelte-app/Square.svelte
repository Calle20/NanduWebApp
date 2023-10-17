<script>
    import {
        dndzone,
        TRIGGERS,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";
    // import { boardGrid } from "./store";

    export let id;
    export let letters;
    import Tile from "./Tile.svelte";
    let items = [];

    function handleDndConsider(e) {
        document.getElementById("rack").style.opacity = 0.5;
        items = e.detail.items;
    }
    function handleDndFinalize(e) {
        const id = e.target.id;
        // console.log(id);
        const height = $letters.length;
        const y = Math.floor(id / height); // the x values in the array are the columns in the elements, vice versa
        const x = id % height; // It works hence you will not change it.
        // I have y and x switched bc the letters must be [row][column] (see the example files)
        // console.log(e.detail.items[0].letter);
        if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
            let new_letter = e.detail.items[0].letter;
            $letters[x][y] = new_letter;
        } else {
            $letters[x][y] = "X";
        }
        // console.log($letters[x][y], length, height, x, y);
        // console.log($letters);
        document.getElementById("rack").style.opacity = 1;
        items = e.detail.items;
    }

    $: options = {
        dropFromOthersDisabled: items.length,
        items,
        dropTargetStyle: {},
        flipDurationMs: 10,
    };

    // $: console.log(items);
</script>

<div
    class="square"
    {id}
    style={items.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
        ? "background: rgba(255, 255, 255, 0.2)"
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
        height: calc(2px + min(5vmin, 50px));
        width: calc(2px + min(5vmin, 50px));
        border-radius: calc(min(5vmin, 50px) / 6.25);
        background-color: #fdfdfd1e;
    }
</style>
