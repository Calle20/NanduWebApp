<script>
    export let letter;
    export let className;

    import Drag_indicator from "svelte-google-materialdesign-icons/Drag_indicator.svelte";
</script>

<div class="{className} tile">
    <div class="letter no-select flex-container">
        <div inert>
            <Drag_indicator size="4vmin" color="rgba(0,0,0,50%)" />
        </div>
        <div class="letter-flex">
            {#each letter as character}
                <b>{character}</b>
            {/each}
        </div>
    </div>
</div>

<style>
    :global(.tile) {
        height: calc(max(5vmin, 50px) - 2px);
        width: calc(max(10vmin, 100px) - 4px);
        border-radius: calc(max(5vmin, 50px) / 6.25);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .flex-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 90%;
        height: 90%;
    }

    .letter-flex {
        font-size: large;
        display: flex;
        width: 50%;
        align-items: center;
        justify-content: space-between;
    }

    .letter {
        font-size: 2vmin;
        /* color: #707070; */
        color: black;
    }

    :global(.r) {
        background-image: linear-gradient(
            to right,
            color-mix(in srgb, #dc3546 69%, #272727),
            #dc3546
        );
    }
    :global(.R) {
        background-image: linear-gradient(
            to left,
            color-mix(in srgb, #dc3546 69%, #272727),
            #dc3546
        );
    }
    :global(.W) {
        background-color: aliceblue;
    }

    :global(.B) {
        background-color: cornflowerblue;
    }
</style>
