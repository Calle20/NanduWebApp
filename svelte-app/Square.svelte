<script>
    import {
        dndzone,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";

    import Tile from "./Tile.svelte";
    let items = [];

    function handleDndConsider(e) {
        document.getElementById("rack").style.opacity = 0.5;
        items = e.detail.items;
    }
    function handleDndFinalize(e) {
        document.getElementById("rack").style.opacity = 1;
        items = e.detail.items;
    }

    $: options = {
        dropFromOthersDisabled: false,
        items,
        dropTargetStyle: {},
        flipDurationMs: 10,
    };
</script>

<div
    class="square"
    style={items.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
        ? "background: rgba(255, 255, 255, 0.2)"
        : ""}
    use:dndzone={options}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
>
    {#each items as tile (tile.id)}
        <Tile letter={tile.letter} id={tile.letter} />
    {/each}
</div>

<style>
    .square {
        border: 2px solid #272727;
        height: calc(2px + min(5vmin, 50px));
        width: 10vmin;
        border-radius: calc(min(5vmin, 50px) / 6.25);
        background-color: #fdfdfd1e;
    }
</style>
