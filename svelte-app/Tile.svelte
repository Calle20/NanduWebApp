<script>
    export let letter;
    export let className;
</script>

<div class="{className} tile">
    <div class="letter no-select">
        <b>{letter}</b>
    </div>
</div>

<style>
    :global(.tile) {
        height: calc(min(5vmin, 50px) - 2px);
        width: calc(min(10vmin, 100px) - 4px);
        /* border: 2px solid #272727; */
        border-radius: calc(min(5vmin, 50px) / 6.25);
        display: flex;
        align-items: center;
        justify-content: center;
        /* background-color: #ffebeb; */
    }

    .letter {
        font-size: 2vmin;
        /* color: #707070; */
        color: black;
    }

    :global(.r) {
        width: calc(min(5vmin, 50px) - 4px);
        background: color-mix(in srgb, #dc3546 69%, #272727);
    }
    :global(.R) {
        width: calc(min(5vmin, 50px) - 4px);
        background: #dc3546;
    }
    :global(.W) {
        background-color: aliceblue;
    }

    :global(.B) {
        background-color: cornflowerblue;
    }
</style>
