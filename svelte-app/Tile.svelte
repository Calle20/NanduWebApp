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
        height: calc(min(5vmin, 50px));
        width: calc(min(5vmin, 50px));
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
        background: color-mix(in srgb, #dc3546 69%, #272727);
    }
    :global(.R) {
        background: #dc3546;
    }
    :global(.W) {
        background-color: aliceblue;
    }

    :global(.B) {
        background-color: cornflowerblue;
    }
</style>
